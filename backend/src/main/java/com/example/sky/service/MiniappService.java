package com.example.sky.service;

import com.alibaba.fastjson2.JSONObject;
import com.example.sky.common.JwtUtil;
import com.example.sky.common.PageResult;
import com.example.sky.common.RedisUtil;
import com.example.sky.common.SnowflakeIdGenerator;
import com.example.sky.dto.MiniappCartItemDto;
import com.example.sky.dto.MiniappCartNumberDto;
import com.example.sky.dto.MiniappUserLoginDto;
import com.example.sky.dto.MiniappOrderPageDto;
import com.example.sky.dto.MiniappOrderSubmitDto;
import com.example.sky.exception.BusinessException;
import com.example.sky.mapper.MiniappUserMapper;
import com.example.sky.vo.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor
public class MiniappService {
    private final RestClient restClient;

    private final MiniappUserMapper userMapper;

    private final JwtUtil jwtUtil;

    private final RedisUtil redisUtil;

    private final SnowflakeIdGenerator snowflakeIdGenerator;

    private String Wxurl = "https://api.weixin.qq.com/sns/jscode2session";

    @Value("${wx.appid}")
    private String appid;

    @Value("${wx.secret}")
    private String secret;


    public MiniappLoginVo login(MiniappUserLoginDto miniappUserLoginDto){
        String code = miniappUserLoginDto.getCode();
        String response = restClient.get()
                .uri(Wxurl,uriBuilder -> uriBuilder
                        .queryParam("appid", appid)
                        .queryParam("secret", secret)
                        .queryParam("js_code", code)
                        .queryParam("grant_type", "authorization_code")
                        .build())
                .retrieve()
                .body(String.class);
        log.info("微信登录信息==>{}",response);
        JSONObject jsonObject = JSONObject.parseObject(response);
        String openid = jsonObject.getString("openid");
        if (openid == null || openid.isEmpty()) {
            throw new RuntimeException("微信登录获取openid失败");
        }

        MiniappUserVo userDb = userMapper.miniappUserByOpenid(openid);
        if (userDb == null) {
            MiniappUserVo newUser = new MiniappUserVo();
            newUser.setOpenid(openid);
            newUser.setCreateTime(LocalDateTime.now());
            userMapper.insertMiniappUser(newUser);
            userDb = userMapper.miniappUserByOpenid(openid);
        }

        String token = jwtUtil.generateToken(openid,"miniapp");
        MiniappLoginVo userInfo = new MiniappLoginVo();
        userDb.setOpenid("*****");
        userInfo.setToken(token);
        userInfo.setUser(userDb);
        return userInfo;
    }

    public List<MiniappDishVo> dishListService(String dishId){
        return userMapper.dishListMapper(dishId);
    }

    public List<MiniappShopingCartVo>shopingCartService(String openid){
        return userMapper.shoppingCartMapper(currentUserId(openid));
    }

    public List<SetmealVo> setmealListService(Long categoryId){
        return userMapper.setmealListMapper(categoryId);
    }

    public List<MiniappDishFlavorVo> dishFlavorListService(Long dishId){
        return userMapper.dishFlavorListMapper(dishId);
    }

    @Transactional
    public void subtractCartService(String openid, MiniappCartItemDto data){
        validateCartItem(data);
        Long userId = currentUserId(openid);
        userMapper.lockCartUserMapper(userId);
        MiniappShopingCartVo item = userMapper.cartItemMapper(userId, data);
        if (item == null) {
            throw new BusinessException(404, "购物车中没有该商品或口味");
        }
        if (item.getNumber() > 1) {
            userMapper.subtractCartItemMapper(item.getId(), userId);
        } else {
            userMapper.deleteCartItemMapper(item.getId(), userId);
        }
    }

    @Transactional
    public void cleanCartService(String openid){
        Long userId = currentUserId(openid);
        userMapper.lockCartUserMapper(userId);
        userMapper.cleanCartMapper(userId);
    }

    @Transactional
    public void updateCartNumberService(String openid, MiniappCartNumberDto data){
        Long userId = currentUserId(openid);
        userMapper.lockCartUserMapper(userId);
        int rows;
        if (data.getNumber() == 0) {
            rows = userMapper.deleteCartItemMapper(data.getId(), userId);
        } else {
            rows = userMapper.updateCartNumberMapper(userId, data);
        }
        if (rows == 0) {
            throw new BusinessException(404, "购物车记录不存在");
        }
    }

    public List<MiniappAddressBookVo> addressBookListService(String openid){
        return userMapper.addressBookListMapper(currentUserId(openid));
    }

    public MiniappAddressBookVo addressBookByIdService(String openid, Long id){
        return requireAddress(id, currentUserId(openid));
    }

    public MiniappAddressBookVo defaultAddressService(String openid){
        return userMapper.defaultAddressMapper(currentUserId(openid));
    }

    public void insertAddressBookService(String openid, MiniappAddressBookVo data){
        userMapper.insertAddressBookMapper(currentUserId(openid), data);
    }

    public void updateAddressBookService(String openid, MiniappAddressBookVo data){
        if (data.getId() == null) {
            throw new BusinessException(400, "地址ID不能为空");
        }
        if (userMapper.updateAddressBookMapper(currentUserId(openid), data) == 0) {
            throw new BusinessException(404, "地址不存在");
        }
    }

    public void deleteAddressBookService(String openid, Long id){
        if (userMapper.deleteAddressBookMapper(id, currentUserId(openid)) == 0) {
            throw new BusinessException(404, "地址不存在");
        }
    }

    @Transactional
    public void setDefaultAddressService(String openid, Long id){
        Long userId = currentUserId(openid);
        requireAddress(id, userId);
        userMapper.setDefaultAddressMapper(id, userId);
    }

    public void cancelOrderService(String openid, Long id){
        Long userId = currentUserId(openid);
        if (userMapper.cancelOrderMapper(id, userId) == 0) {
            throw new BusinessException(400, "订单不存在或当前状态不能取消");
        }
        deleteOrderHistoryCache(userId);
    }

    private Long currentUserId(String openid){
        MiniappUserVo user = userMapper.miniappUserByOpenid(openid);
        if (user == null) {
            throw new BusinessException(401, "用户不存在，请重新登录");
        }
        return user.getId();
    }

    private MiniappAddressBookVo requireAddress(Long id, Long userId){
        MiniappAddressBookVo address = userMapper.addressBookByIdMapper(id, userId);
        if (address == null) {
            throw new BusinessException(404, "地址不存在");
        }
        return address;
    }

    public Integer shopStatusService(Long shopId){
        Integer status = userMapper.shopStatusMapper(shopId);
        if (status == null) {
            throw new BusinessException(404, "店铺不存在");
        }
        return status;
    }

    public MiniappShopVo getMerchantInfoService(Long shopId){
        MiniappShopVo shop = userMapper.getMerchantInfoMapper(shopId);
        if (shop == null) {
            throw new BusinessException(404, "店铺不存在");
        }
        return shop;
    }

    @Transactional
    public Integer addShopCart(String openId, MiniappCartItemDto cartData) {
        Long userId = currentUserId(openId);
        userMapper.lockCartUserMapper(userId);
        return addCartItem(userId, cartData, 1);
    }

    private void validateCartItem(MiniappCartItemDto data){
        if ((data.getDishId() == null) == (data.getSetmealId() == null)) {
            throw new BusinessException(400, "菜品ID和套餐ID必须且只能传一个");
        }
        if (data.getSetmealId() != null) {
            data.setDishFlavor(null);
        }
    }

    private int addCartItem(Long userId, MiniappCartItemDto data, int number){
        validateCartItem(data);
        if (number <= 0) {
            throw new BusinessException(400, "商品数量必须大于0");
        }
        MiniappShopingCartVo cart = new MiniappShopingCartVo()
                .setUserId(userId)
                .setDishId(data.getDishId())
                .setSetmealId(data.getSetmealId())
                .setDishFlavor(data.getDishFlavor() == null ? "" : data.getDishFlavor())
                .setNumber(number);
        if (data.getDishId() != null) {
            DishVo dish = userMapper.getDishInfoMapper(data.getDishId());
            if (dish == null || !Integer.valueOf(1).equals(dish.getStatus()) || dish.getPrice() == null) {
                throw new BusinessException(400, "菜品不存在或已停售");
            }
            cart.setName(dish.getName()).setImage(dish.getImage()).setAmount(dish.getPrice());
        } else {
            SetmealVo setmeal = userMapper.getSetmealInfoMapper(data.getSetmealId());
            if (setmeal == null || !Integer.valueOf(1).equals(setmeal.getStatus())) {
                throw new BusinessException(400, "套餐不存在或已停售");
            }
            cart.setName(setmeal.getName()).setImage(setmeal.getImage()).setAmount(setmeal.getPrice());
        }
        MiniappShopingCartVo exist = userMapper.cartItemMapper(userId, data);
        if (exist != null) {
            cart.setId(exist.getId());
            return userMapper.increaseCartItemMapper(cart);
        }
        return userMapper.insertCart(cart);
    }

    public List<MiniappSetmealDishVo> setmealDishesService(Long id){
        SetmealVo setmeal = userMapper.getSetmealInfoMapper(id);
        if (setmeal == null || !Integer.valueOf(1).equals(setmeal.getStatus())) {
            throw new BusinessException(404, "套餐不存在或已停售");
        }
        return userMapper.setmealDishesMapper(id);
    }

    public PageResult<MiniappOrderVo> historyOrdersService(String openid, MiniappOrderPageDto query){
        Long userId = currentUserId(openid);
        // 历史订单缓存：key 为 order:{userid}:history，value 为该用户全部历史订单及明细，缓存1分钟。
        // 同一个key不区分页码和状态，读取后再筛选分页；下单、支付、取消、退款、催单及管理端更新后删除缓存。
        String key = orderHistoryCacheKey(userId);
        MiniappOrderVo[] cached = null;
        try {
            cached = redisUtil.get(key, MiniappOrderVo[].class);
        } catch (DataAccessException e) {
            log.warn("历史订单缓存读取失败，改为查询数据库，userId={}", userId);
        }
        List<MiniappOrderVo> orders;
        if (cached != null) {
            orders = Arrays.asList(cached);
        } else {
            orders = userMapper.historyOrdersMapper(userId);
            fillOrderDetails(orders);
            try {
                redisUtil.set(key, orders, 1, TimeUnit.MINUTES);
            } catch (DataAccessException e) {
                log.warn("历史订单缓存写入失败，userId={}", userId);
            }
        }
        List<MiniappOrderVo> filtered = orders.stream()
                .filter(order -> query.getStatus() == null || Objects.equals(order.getStatus(), query.getStatus()))
                .filter(order -> query.getPayStatus() == null || Objects.equals(order.getPayStatus(), query.getPayStatus()))
                .toList();
        int start = (int) Math.min((long) (query.getPage() - 1) * query.getPageSize(), filtered.size());
        int end = Math.min(start + query.getPageSize(), filtered.size());
        PageResult<MiniappOrderVo> page = new PageResult<>();
        page.setPageNum(query.getPage());
        page.setPageSize(query.getPageSize());
        page.setTotal((long) filtered.size());
        page.setList(filtered.subList(start, end));
        return page;
    }

    public MiniappOrderVo orderDetailService(String openid, Long id){
        MiniappOrderVo order = requireUserOrder(id, currentUserId(openid));
        fillOrderDetails(List.of(order));
        return order;
    }

    private MiniappOrderVo requireUserOrder(Long id, Long userId){
        MiniappOrderVo order = userMapper.userOrderByIdMapper(id, userId);
        if (order == null) {
            throw new BusinessException(404, "订单不存在");
        }
        return order;
    }

    private void fillOrderDetails(List<MiniappOrderVo> orders){
        if (orders.isEmpty()) {
            return;
        }
        List<Long> ids = orders.stream().map(MiniappOrderVo::getId).toList();
        Map<Long, List<MiniappOrderDetailVo>> details = userMapper.orderDetailsMapper(ids).stream()
                .collect(Collectors.groupingBy(MiniappOrderDetailVo::getOrderId));
        for (MiniappOrderVo order : orders) {
            order.setOrderDetailList(details.getOrDefault(order.getId(), List.of()));
        }
    }

    @Transactional
    public void repetitionOrderService(String openid, Long id){
        Long userId = currentUserId(openid);
        requireUserOrder(id, userId);
        List<MiniappOrderDetailVo> details = userMapper.orderDetailsMapper(List.of(id));
        if (details.isEmpty()) {
            throw new BusinessException(400, "订单没有商品明细");
        }
        userMapper.lockCartUserMapper(userId);
        // 清空和重新加购放在同一事务中，商品停售或数据异常时保留原购物车。
        userMapper.cleanCartMapper(userId);
        for (MiniappOrderDetailVo detail : details) {
            MiniappCartItemDto item = new MiniappCartItemDto();
            item.setDishId(detail.getDishId());
            item.setSetmealId(detail.getSetmealId());
            item.setDishFlavor(detail.getDishFlavor());
            if (detail.getNumber() == null) {
                throw new BusinessException(400, "订单商品数量异常");
            }
            addCartItem(userId, item, detail.getNumber());
        }
    }

    private String orderHistoryCacheKey(Long userId){
        return "order:" + userId + ":history";
    }

    @Transactional
    public MiniappOrderVo submitOrderService(String openid, MiniappOrderSubmitDto data){
        Long userId = currentUserId(openid);
        userMapper.lockCartUserMapper(userId);
        MiniappAddressBookVo address = requireAddress(data.getAddressBookId(), userId);
        MiniappShopVo shop = userMapper.activeShopMapper(data.getShopId());
        if (shop == null) {
            throw new BusinessException(400, "店铺不存在或当前休息");
        }
        List<MiniappShopingCartVo> cartItems = userMapper.shoppingCartMapper(userId);
        if (cartItems.isEmpty()) {
            throw new BusinessException(400, "购物车为空，无法提交订单");
        }

        List<MiniappOrderDetailVo> details = new ArrayList<>();
        int itemCount = 0;
        BigDecimal goodsAmount = BigDecimal.ZERO;
        for (MiniappShopingCartVo item : cartItems) {
            if (item.getNumber() == null || item.getNumber() < 1) {
                throw new BusinessException(400, "购物车商品数量无效");
            }
            MiniappOrderDetailVo detail = new MiniappOrderDetailVo();
            detail.setDishId(item.getDishId());
            detail.setSetmealId(item.getSetmealId());
            detail.setDishFlavor(item.getDishFlavor());
            detail.setNumber(item.getNumber());
            if (item.getDishId() != null && item.getSetmealId() == null) {
                DishVo dish = userMapper.getDishInfoMapper(item.getDishId());
                if (dish == null || !Integer.valueOf(1).equals(dish.getStatus()) || dish.getPrice() == null) {
                    throw new BusinessException(400, "购物车中有菜品已停售，请调整后重试");
                }
                detail.setName(dish.getName());
                detail.setImage(dish.getImage());
                detail.setAmount(dish.getPrice());
            } else if (item.getSetmealId() != null && item.getDishId() == null) {
                SetmealVo setmeal = userMapper.getSetmealInfoMapper(item.getSetmealId());
                if (setmeal == null || !Integer.valueOf(1).equals(setmeal.getStatus())) {
                    throw new BusinessException(400, "购物车中有套餐已停售，请调整后重试");
                }
                detail.setName(setmeal.getName());
                detail.setImage(setmeal.getImage());
                detail.setAmount(setmeal.getPrice());
            } else {
                throw new BusinessException(400, "购物车商品数据无效");
            }
            goodsAmount = goodsAmount.add(detail.getAmount().multiply(BigDecimal.valueOf(detail.getNumber())));
            itemCount = Math.addExact(itemCount, detail.getNumber());
            details.add(detail);
        }

        BigDecimal deliveryFee = shop.getDeliveryFee();
        BigDecimal packPrice = shop.getPackPrice();
        if (deliveryFee == null || packPrice == null) {
            throw new BusinessException(400, "店铺费用尚未配置");
        }
        BigDecimal packAmount = packPrice.multiply(BigDecimal.valueOf(itemCount)).setScale(2, RoundingMode.HALF_UP);
        LocalDateTime orderTime = LocalDateTime.now();
        LocalDateTime estimatedDeliveryTime = data.getEstimatedDeliveryTime();
        if (Integer.valueOf(1).equals(data.getDeliveryStatus())) {
            estimatedDeliveryTime = orderTime.plusMinutes(30);
        } else if (estimatedDeliveryTime == null || !estimatedDeliveryTime.isAfter(orderTime)) {
            throw new BusinessException(400, "请选择有效的送达时间");
        }

        MiniappOrderVo order = new MiniappOrderVo();
        order.setNumber(String.valueOf(snowflakeIdGenerator.nextId()));
        order.setUserId(userId);
        order.setAddressBookId(address.getId());
        order.setShopId(shop.getShopId());
        order.setShopName(shop.getShopName());
        order.setShopTelephone(shop.getPhone());
        order.setConsignee(address.getConsignee());
        order.setSex(address.getSex());
        order.setPhone(address.getPhone());
        order.setAddress(String.join("", Objects.toString(address.getProvinceName(), ""),
                Objects.toString(address.getCityName(), ""), Objects.toString(address.getDistrictName(), ""),
                Objects.toString(address.getDetail(), "")));
        order.setOrderTime(orderTime);
        order.setStatus(1);
        order.setPayStatus(0);
        order.setPayMethod(1);
        order.setRemark(data.getRemark());
        order.setDeliveryStatus(data.getDeliveryStatus());
        order.setEstimatedDeliveryTime(estimatedDeliveryTime);
        order.setTablewareStatus(data.getTablewareStatus());
        order.setTablewareNumber(data.getTablewareStatus() == 1 ? itemCount : data.getTablewareNumber());
        order.setPackAmount(packAmount);
        order.setDeliveryFee(deliveryFee);
        order.setAmount(goodsAmount.add(packAmount).add(deliveryFee).setScale(2, RoundingMode.HALF_UP));
        userMapper.insertOrderMapper(order);
        for (MiniappOrderDetailVo detail : details) {
            detail.setOrderId(order.getId());
            userMapper.insertOrderDetailMapper(detail);
        }
        userMapper.cleanCartMapper(userId);
        order.setOrderDetailList(details);
        deleteOrderHistoryCache(userId);
        return order;
    }

    public void paymentOrderService(String openid, String orderNumber){
        Long userId = currentUserId(openid);
        MiniappOrderVo order = userMapper.userOrderByNumberMapper(orderNumber, userId);
        if (order == null) {
            throw new BusinessException(404, "订单不存在");
        }
        // 简化支付：仅更新本地订单状态，不调用微信支付，不产生真实扣款。
        if (userMapper.payOrderMapper(order.getId(), userId) != 1) {
            if (Integer.valueOf(1).equals(order.getPayStatus()) && order.getStatus() >= 2 && order.getStatus() <= 5) {
                return;
            }
            throw new BusinessException(400, "订单已取消、支付超时或当前状态不允许支付");
        }
        deleteOrderHistoryCache(userId);
    }

    public void refundOrderService(String openid, Long id){
        Long userId = currentUserId(openid);
        // 简化退款：已付款订单直接标记为已退款，不涉及支付平台资金操作。
        if (userMapper.refundOrderMapper(id, userId) != 1) {
            MiniappOrderVo order = requireUserOrder(id, userId);
            if (!Integer.valueOf(2).equals(order.getPayStatus())) {
                throw new BusinessException(400, "当前订单状态不允许退款");
            }
        }
        deleteOrderHistoryCache(userId);
    }

    public void reminderOrderService(String openid, Long id){
        Long userId = currentUserId(openid);
        if (userMapper.remindOrderMapper(id, userId) != 1) {
            throw new BusinessException(400, "只有已付款且正在处理的订单可以催单");
        }
        deleteOrderHistoryCache(userId);
    }

    public void deleteOrderHistoryCache(Long userId){
        try {
            redisUtil.delete(orderHistoryCacheKey(userId));
        } catch (DataAccessException e) {
            log.warn("历史订单缓存删除失败，将在1分钟内过期，userId={}", userId);
        }
    }
}

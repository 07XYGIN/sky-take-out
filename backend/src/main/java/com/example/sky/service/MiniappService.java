package com.example.sky.service;

import com.alibaba.fastjson2.JSONObject;
import com.example.sky.common.JwtUtil;
import com.example.sky.dto.MiniappCartItemDto;
import com.example.sky.dto.MiniappCartNumberDto;
import com.example.sky.dto.MiniappUserLoginDto;
import com.example.sky.exception.BusinessException;
import com.example.sky.mapper.MiniappUserMapper;
import com.example.sky.vo.MiniappAddressBookVo;
import com.example.sky.vo.MiniappDishVo;
import com.example.sky.vo.MiniappDishFlavorVo;
import com.example.sky.vo.MiniappLoginVo;
import com.example.sky.vo.MiniappShopVo;
import com.example.sky.vo.MiniappShopingCartVo;
import com.example.sky.vo.MiniappUserVo;
import com.example.sky.vo.SetmealVo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.List;


@Slf4j
@Service
@RequiredArgsConstructor
public class MiniappService {
    private final RestClient restClient;

    private final MiniappUserMapper userMapper;

    private final JwtUtil jwtUtil;

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
        if ((data.getDishId() == null) == (data.getSetmealId() == null)) {
            throw new BusinessException(400, "菜品ID和套餐ID必须且只能传一个");
        }
        if (data.getSetmealId() != null) {
            data.setDishFlavor(null);
        }
        Long userId = currentUserId(openid);
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

    public void cleanCartService(String openid){
        userMapper.cleanCartMapper(currentUserId(openid));
    }

    public void updateCartNumberService(String openid, MiniappCartNumberDto data){
        Long userId = currentUserId(openid);
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

    public void cancelUnpaidOrderService(String openid, Long id){
        if (userMapper.cancelUnpaidOrderMapper(id, currentUserId(openid)) == 0) {
            throw new BusinessException(400, "订单不存在或状态不允许取消，仅支持取消未支付订单");
        }
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
}

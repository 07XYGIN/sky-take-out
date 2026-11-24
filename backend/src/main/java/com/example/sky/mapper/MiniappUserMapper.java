package com.example.sky.mapper;

import com.example.sky.dto.MiniappCartItemDto;
import com.example.sky.dto.MiniappCartNumberDto;
import com.example.sky.vo.*;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Many;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;
import org.apache.ibatis.annotations.Options;

import java.util.List;

@Mapper
public interface MiniappUserMapper {

    @Select("select * from user where openid = #{openid}")
    MiniappUserVo miniappUserByOpenid(String openid);

    @Insert("INSERT INTO user (openid, name, phone, sex, id_number, avatar, create_time) " +
            "VALUES (#{openid}, #{name}, #{phone}, #{sex}, #{idNumber}, #{avatar}, NOW())")
    int insertMiniappUser(MiniappUserVo miniappUser);

    @Select("select id, name, price, image, description from dish where category_id = #{dishId}")
    @Results({
            @Result(column = "id", property = "id", id = true),
            @Result(column = "id", property = "flavors", many = @Many(select = "dishFlavorListMapper"))
    })
    List<MiniappDishVo> dishListMapper(String dishId);

    @Select("select name, value from dish_flavor where dish_id = #{dishId} order by id")
    List<MiniappDishFlavorVo> dishFlavorListMapper(Long dishId);

    @Select("select id, name, image, amount, number, dish_flavor, dish_id, setmeal_id " +
            "from shopping_cart where user_id = #{userId} order by create_time, id")
    List<MiniappShopingCartVo> shoppingCartMapper(Long userId);

    @Select("select id, name, category_id, price, image, description, status from setmeal " +
            "where category_id = #{categoryId} and status = 1 order by id")
    List<SetmealVo> setmealListMapper(Long categoryId);

    @Select("select id, number from shopping_cart where user_id = #{userId} " +
            "and dish_id <=> #{data.dishId} and setmeal_id <=> #{data.setmealId} " +
            "and coalesce(dish_flavor, '') = coalesce(#{data.dishFlavor}, '') " +
            "order by id limit 1 for update")
    MiniappShopingCartVo cartItemMapper(@Param("userId") Long userId, @Param("data") MiniappCartItemDto data);

    @Update("update shopping_cart set number = number - 1 where id = #{id} and user_id = #{userId} and number > 1")
    int subtractCartItemMapper(@Param("id") Long id, @Param("userId") Long userId);

    @Update("update shopping_cart set number = #{data.number} where id = #{data.id} and user_id = #{userId}")
    int updateCartNumberMapper(@Param("userId") Long userId, @Param("data") MiniappCartNumberDto data);

    @Delete("delete from shopping_cart where id = #{id} and user_id = #{userId}")
    int deleteCartItemMapper(@Param("id") Long id, @Param("userId") Long userId);

    @Delete("delete from shopping_cart where user_id = #{userId}")
    int cleanCartMapper(Long userId);

    @Select("select * from address_book where user_id = #{userId} order by is_default desc, id desc")
    List<MiniappAddressBookVo> addressBookListMapper(Long userId);

    @Select("select * from address_book where id = #{id} and user_id = #{userId}")
    MiniappAddressBookVo addressBookByIdMapper(@Param("id") Long id, @Param("userId") Long userId);

    @Select("select * from address_book where user_id = #{userId} and is_default = 1 order by id desc limit 1")
    MiniappAddressBookVo defaultAddressMapper(Long userId);

    @Insert("insert into address_book (user_id, consignee, sex, phone, province_code, province_name, " +
            "city_code, city_name, district_code, district_name, detail, label, is_default) " +
            "values (#{userId}, #{data.consignee}, #{data.sex}, #{data.phone}, #{data.provinceCode}, " +
            "#{data.provinceName}, #{data.cityCode}, #{data.cityName}, #{data.districtCode}, " +
            "#{data.districtName}, #{data.detail}, #{data.label}, 0)")
    int insertAddressBookMapper(@Param("userId") Long userId, @Param("data") MiniappAddressBookVo data);

    @Update("update address_book set consignee = #{data.consignee}, sex = #{data.sex}, phone = #{data.phone}, " +
            "province_code = #{data.provinceCode}, province_name = #{data.provinceName}, " +
            "city_code = #{data.cityCode}, city_name = #{data.cityName}, district_code = #{data.districtCode}, " +
            "district_name = #{data.districtName}, detail = #{data.detail}, label = #{data.label} " +
            "where id = #{data.id} and user_id = #{userId}")
    int updateAddressBookMapper(@Param("userId") Long userId, @Param("data") MiniappAddressBookVo data);

    @Delete("delete from address_book where id = #{id} and user_id = #{userId}")
    int deleteAddressBookMapper(@Param("id") Long id, @Param("userId") Long userId);

    @Update("update address_book set is_default = case when id = #{id} then 1 else 0 end where user_id = #{userId}")
    int setDefaultAddressMapper(@Param("id") Long id, @Param("userId") Long userId);

    @Update("update orders set status = case when pay_status = 1 then 7 else 6 end, " +
            "pay_status = case when pay_status = 1 then 2 else pay_status end, " +
            "cancel_reason = '用户主动取消', cancel_time = now() " +
            "where id = #{id} and user_id = #{userId} " +
            "and ((status = 1 and pay_status = 0) or (status in (2,3,4) and pay_status = 1))")
    int cancelOrderMapper(@Param("id") Long id, @Param("userId") Long userId);

    @Select("select status from shop where shop_id = #{shopId}")
    Integer shopStatusMapper(Long shopId);

    @Select("select shop_id, shop_name, image, description, shop_address, phone, status, delivery_fee, pack_price " +
            "from shop where shop_id = #{shopId} and status = 1")
    MiniappShopVo activeShopMapper(Long shopId);

    @Select("select shop_id, shop_name, image, description, shop_address, phone, status, delivery_fee, pack_price " +
            "from shop where shop_id = #{shopId}")
    MiniappShopVo getMerchantInfoMapper(Long shopId);

    @Select("select id, name, image, price, status from dish where id = #{dishId}")
    DishVo getDishInfoMapper(Long dishId);

    @Select("select id, name, image, price, status from setmeal where id = #{setmealId}")
    SetmealVo getSetmealInfoMapper(Long setmealId);

    @Select("select sd.dish_id as id, sd.name, sd.price, sd.copies, d.image, d.description " +
            "from setmeal_dish sd left join dish d on sd.dish_id = d.id " +
            "where sd.setmeal_id = #{setmealId} order by sd.id")
    List<MiniappSetmealDishVo> setmealDishesMapper(Long setmealId);

    @Insert("insert into shopping_cart (" +
            "name, image, user_id, dish_id, setmeal_id, dish_flavor, amount, number, create_time" +
            ") values (" +
            "#{name}, #{image}, #{userId}, #{dishId}, #{setmealId}, #{dishFlavor}, #{amount}, #{number}, now()" +
            ")")
    int insertCart(MiniappShopingCartVo shoppingCart);

    @Select("select id from user where id = #{userId} for update")
    Long lockCartUserMapper(Long userId);

    @Update("update shopping_cart set number = number + #{number}, name = #{name}, image = #{image}, amount = #{amount} " +
            "where id = #{id} and user_id = #{userId}")
    int increaseCartItemMapper(MiniappShopingCartVo shoppingCart);

    @Select("select o.*, date_add(o.order_time, interval 15 minute) as pay_deadline " +
            "from orders o where o.user_id = #{userId} order by o.order_time desc, o.id desc")
    List<MiniappOrderVo> historyOrdersMapper(Long userId);

    @Select("select o.*, date_add(o.order_time, interval 15 minute) as pay_deadline " +
            "from orders o where o.id = #{id} and o.user_id = #{userId}")
    MiniappOrderVo userOrderByIdMapper(@Param("id") Long id, @Param("userId") Long userId);

    @Select({"<script>",
            "select id, order_id, dish_id, setmeal_id, name, image, dish_flavor, number, amount from order_detail",
            "where order_id in",
            "<foreach collection='orderIds' item='id' open='(' separator=',' close=')'>#{id}</foreach>",
            "order by order_id, id",
            "</script>"})
    List<MiniappOrderDetailVo> orderDetailsMapper(@Param("orderIds") List<Long> orderIds);

    @Insert("insert into orders (number, status, user_id, address_book_id, order_time, pay_method, pay_status, " +
            "amount, remark, phone, address, user_name, consignee, sex, estimated_delivery_time, delivery_status, " +
            "pack_amount, tableware_number, tableware_status, shop_id, shop_name, shop_telephone, delivery_fee) " +
            "values (#{number}, 1, #{userId}, #{addressBookId}, #{orderTime}, 1, 0, " +
            "#{amount}, #{remark}, #{phone}, #{address}, #{consignee}, #{consignee}, #{sex}, #{estimatedDeliveryTime}, " +
            "#{deliveryStatus}, #{packAmount}, #{tablewareNumber}, #{tablewareStatus}, #{shopId}, " +
            "#{shopName}, #{shopTelephone}, #{deliveryFee})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertOrderMapper(MiniappOrderVo order);

    @Insert("insert into order_detail (order_id, dish_id, setmeal_id, name, image, dish_flavor, number, amount) " +
            "values (#{orderId}, #{dishId}, #{setmealId}, #{name}, #{image}, #{dishFlavor}, #{number}, #{amount})")
    int insertOrderDetailMapper(MiniappOrderDetailVo detail);

    @Select("select o.*, date_add(o.order_time, interval 15 minute) as pay_deadline " +
            "from orders o where o.number = #{number} and o.user_id = #{userId}")
    MiniappOrderVo userOrderByNumberMapper(@Param("number") String number, @Param("userId") Long userId);

    @Update("update orders set status = 2, pay_status = 1, checkout_time = now() " +
            "where id = #{id} and user_id = #{userId} and status = 1 and pay_status = 0 " +
            "and order_time >= date_sub(now(), interval 15 minute)")
    int payOrderMapper(@Param("id") Long id, @Param("userId") Long userId);

    @Update("update orders set status = 7, pay_status = 2, cancel_time = now(), cancel_reason = '用户申请退款' " +
            "where id = #{id} and user_id = #{userId} and status in (2,3,4,5) and pay_status = 1")
    int refundOrderMapper(@Param("id") Long id, @Param("userId") Long userId);

    @Update("update orders set reminder_count = reminder_count + 1, reminder_time = now() " +
            "where id = #{id} and user_id = #{userId} and status in (2,3,4) and pay_status = 1")
    int remindOrderMapper(@Param("id") Long id, @Param("userId") Long userId);
}

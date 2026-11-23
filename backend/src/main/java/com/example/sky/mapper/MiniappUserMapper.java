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

    @Update("update orders set status = 6, cancel_reason = '用户主动取消', cancel_time = now() " +
            "where id = #{id} and user_id = #{userId} and status = 1 and pay_status = 0")
    int cancelUnpaidOrderMapper(@Param("id") Long id, @Param("userId") Long userId);

    @Select("select status from shop where shop_id = #{shopId}")
    Integer shopStatusMapper(Long shopId);

    @Select("select shop_id, shop_name, image, description, shop_address, phone, status, delivery_fee, pack_price " +
            "from shop where shop_id = #{shopId}")
    MiniappShopVo getMerchantInfoMapper(Long shopId);

    @Select("select d.name AS name,d.image AS image ,d.id AS dish_id,d.price AS price from dish d where d.id = #{dishId}")
    DishVo getDishInfoMapper(Long dishId);

    @Insert("insert into shopping_cart (" +
            "name, image, user_id, dish_id, dish_flavor, amount" +
            ") values (" +
            "#{name}, #{image}, #{userId}, #{dishId}, #{dishFlavor}, #{amount}" +
            ")")
    int insertCart(MiniappShopingCartVo shoppingCart);

    @Select("select * from shopping_cart " +
            "where user_id = #{userId} and dish_id = #{dishId} and dish_flavor = #{dishFlavor}")
    MiniappShopingCartVo getCartItem(@Param("userId") Long userId,
                                     @Param("dishId") Long dishId,
                                     @Param("dishFlavor") String dishFlavor);

    @Update("update shopping_cart set number = #{number} where id = #{id}")
    Integer updateNumber(@Param("id") Long id, @Param("number") Integer number);
}

package com.example.sky.mapper;

import com.example.sky.vo.MiniappUserVo;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface MiniappUserMapper {

    @Select("select * from user where openid = #{openid}")
    MiniappUserVo miniappUserByOpenid(String openid);

    @Insert("INSERT INTO user (openid, name, phone, sex, id_number, avatar, create_time) " +
            "VALUES (#{openid}, #{name}, #{phone}, #{sex}, #{idNumber}, #{avatar}, NOW())")
    int insertMiniappUser(MiniappUserVo miniappUser);
}

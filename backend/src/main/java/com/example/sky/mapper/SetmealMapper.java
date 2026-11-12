package com.example.sky.mapper;

import com.example.sky.dto.SetmealPageDto;
import com.example.sky.dto.SetmealSaveDto;
import com.example.sky.vo.SetmealVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface SetmealMapper {
    List<SetmealVo> selectSetmealPage(SetmealPageDto query);
    SetmealVo getSetmealById(@Param("id") Long id);
    int countCategory(@Param("id") Long id);
    int insertSetmeal(SetmealSaveDto data);
    int updateSetmeal(SetmealSaveDto data);
    int updateSetmealStatus(@Param("status") Integer status, @Param("id") Long id);
    int deleteRelations(@Param("id") Long id);
    int deleteById(@Param("id") Long id);

}

package com.example.sky.mapper;

import com.example.sky.dto.DishPageDto;
import com.example.sky.dto.DishSaveDto;
import com.example.sky.vo.DishVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface DishMapper {
    List<DishVo> selectDishPage(DishPageDto query);
    DishVo getDishById(@Param("id") Long id);
    int countCategory(@Param("id") Long id);
    int insertDish(DishSaveDto data);
    int updateDish(DishSaveDto data);
    int updateDishStatus(@Param("status") Integer status, @Param("id") Long id);
    int deleteRelations(@Param("id") Long id);
    int deleteById(@Param("id") Long id);
    int countSetmealReferences(@Param("id") Long id);
}

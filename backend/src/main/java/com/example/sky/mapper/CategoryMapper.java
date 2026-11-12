package com.example.sky.mapper;

import com.example.sky.dto.CategoryPageDto;
import com.example.sky.vo.CategoryVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CategoryMapper {
    int insertCategory(com.example.sky.dto.CategorySaveDto data);
    int updateCategory(com.example.sky.dto.CategorySaveDto data);
    CategoryVo getById(@Param("id") Long id);
    int countReferences(@Param("id") Long id);
    int deleteById(@Param("id") Long id);
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);
    List<CategoryVo> selectCategoryPage(CategoryPageDto category);

    List<CategoryVo> selectCategoryList(@Param("type") Integer type);
}

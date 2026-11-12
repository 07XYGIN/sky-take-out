package com.example.sky.service;

import com.example.sky.dto.CategoryPageDto;
import com.example.sky.dto.CategorySaveDto;
import com.example.sky.exception.BusinessException;
import com.example.sky.mapper.CategoryMapper;
import com.example.sky.vo.CategoryVo;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryMapper categoryMapper;

    public void saveCategory(CategorySaveDto data, boolean editing) {
        data.setName(data.getName().trim());
        int rows;
        if (editing) {
            CategoryVo old = categoryMapper.getById(data.getId());
            if (old == null) {
                throw new BusinessException(404, "分类不存在");
            }
            if (!old.getType().equals(data.getType()) && categoryMapper.countReferences(data.getId()) > 0) {
                throw new BusinessException(400, "分类已被引用，不能修改分类类型");
            }
            rows = categoryMapper.updateCategory(data);
        } else {
            if (data.getStatus() == null) {
                data.setStatus(1);
            }
            rows = categoryMapper.insertCategory(data);
        }
        if (rows == 0) {
            throw new BusinessException(400, "分类保存失败");
        }
    }

    public void deleteCategory(Long id) {
        if (categoryMapper.countReferences(id) > 0) {
            throw new BusinessException(400, "分类已被菜品或套餐引用，不能删除");
        }
        if (categoryMapper.deleteById(id) == 0) {
            throw new BusinessException(404, "分类不存在");
        }
    }

    public void updateStatus(Long id, Integer status) {
        if (status == null || (status != 0 && status != 1)) {
            throw new BusinessException(400, "状态只能为0或1");
        }
        if (categoryMapper.updateStatus(id, status) == 0) {
            throw new BusinessException(404, "分类不存在");
        }
    }

    public PageInfo<CategoryVo> categoryPageService(CategoryPageDto category) {
        PageHelper.startPage(category.getPage(), category.getPageSize());
        List<CategoryVo> categoryList = categoryMapper.selectCategoryPage(category);
        return new PageInfo<>(categoryList);
    }

    public List<CategoryVo> categoryListService(Integer type) {
        return categoryMapper.selectCategoryList(type);
    }
}

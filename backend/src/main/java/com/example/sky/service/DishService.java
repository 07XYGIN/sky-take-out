package com.example.sky.service;

import com.example.sky.dto.DishPageDto;
import com.example.sky.dto.DishSaveDto;
import com.example.sky.mapper.DishMapper;
import com.example.sky.vo.DishVo;
import com.example.sky.exception.BusinessException;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DishService {
    private final DishMapper dishMapper;

    public PageInfo<DishVo> dishPageService(DishPageDto query) {
        PageHelper.startPage(query.getPage(), query.getPageSize());
        List<DishVo> list = dishMapper.selectDishPage(query);
        return new PageInfo<>(list);
    }

    public DishVo getDishService(Long id) {
        DishVo result = dishMapper.getDishById(id);
        if (result == null) {
            throw new BusinessException(404, "记录不存在");
        }
        return result;
    }

    public void saveDish(DishSaveDto data, boolean editing) {
        data.setName(data.getName().trim());
        if (dishMapper.countCategory(data.getCategoryId()) == 0) {
            throw new BusinessException(400, "请选择正确的分类");
        }
        int rows;
        if (editing) {
            getDishService(data.getId());
            rows = dishMapper.updateDish(data);
        } else {
            if (data.getStatus() == null) {
                data.setStatus(1);
            }
            rows = dishMapper.insertDish(data);
        }
        if (rows == 0) {
            throw new BusinessException(400, "保存失败，记录可能已被删除");
        }
    }

    public void updateStatus(Long id, Integer status) {
        if (status == null || (status != 0 && status != 1)) {
            throw new BusinessException(400, "状态只能为0或1");
        }
        getDishService(id);
        if (dishMapper.updateDishStatus(status, id) == 0) {
            throw new BusinessException(404, "记录不存在");
        }
    }

    // 删除主表和关联表必须一起成功，出错时一起回滚。
    @Transactional
    public void deleteDishs(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new BusinessException(400, "请选择要删除的记录");
        }
        for (Long id : ids) {
            getDishService(id);
            if (dishMapper.countSetmealReferences(id) > 0) {
                throw new BusinessException(400, "菜品已被套餐引用，不能删除");
            }
        }
        for (Long id : ids) {
            dishMapper.deleteRelations(id);
            if (dishMapper.deleteById(id) == 0) {
                throw new BusinessException(404, "记录不存在");
            }
        }
    }
}

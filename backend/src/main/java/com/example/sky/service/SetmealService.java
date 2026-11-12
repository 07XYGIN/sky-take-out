package com.example.sky.service;

import com.example.sky.dto.SetmealPageDto;
import com.example.sky.dto.SetmealSaveDto;
import com.example.sky.mapper.SetmealMapper;
import com.example.sky.vo.SetmealVo;
import com.example.sky.exception.BusinessException;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SetmealService {
    private final SetmealMapper setmealMapper;

    public PageInfo<SetmealVo> setmealPageService(SetmealPageDto query) {
        PageHelper.startPage(query.getPage(), query.getPageSize());
        List<SetmealVo> list = setmealMapper.selectSetmealPage(query);
        return new PageInfo<>(list);
    }

    public SetmealVo getSetmealService(Long id) {
        SetmealVo result = setmealMapper.getSetmealById(id);
        if (result == null) {
            throw new BusinessException(404, "记录不存在");
        }
        return result;
    }

    public void saveSetmeal(SetmealSaveDto data, boolean editing) {
        data.setName(data.getName().trim());
        if (setmealMapper.countCategory(data.getCategoryId()) == 0) {
            throw new BusinessException(400, "请选择正确的分类");
        }
        int rows;
        if (editing) {
            getSetmealService(data.getId());
            rows = setmealMapper.updateSetmeal(data);
        } else {
            if (data.getStatus() == null) {
                data.setStatus(1);
            }
            rows = setmealMapper.insertSetmeal(data);
        }
        if (rows == 0) {
            throw new BusinessException(400, "保存失败，记录可能已被删除");
        }
    }

    public void updateStatus(Long id, Integer status) {
        if (status == null || (status != 0 && status != 1)) {
            throw new BusinessException(400, "状态只能为0或1");
        }
        getSetmealService(id);
        if (setmealMapper.updateSetmealStatus(status, id) == 0) {
            throw new BusinessException(404, "记录不存在");
        }
    }

    // 删除主表和关联表必须一起成功，出错时一起回滚。
    @Transactional
    public void deleteSetmeals(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new BusinessException(400, "请选择要删除的记录");
        }
        for (Long id : ids) {
            getSetmealService(id);

        }
        for (Long id : ids) {
            setmealMapper.deleteRelations(id);
            if (setmealMapper.deleteById(id) == 0) {
                throw new BusinessException(404, "记录不存在");
            }
        }
    }
}

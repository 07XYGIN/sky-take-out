package com.example.sky.controller;

import com.example.sky.common.PageResult;
import com.example.sky.common.Result;
import com.example.sky.dto.DishPageDto;
import com.example.sky.dto.DishSaveDto;
import com.example.sky.service.DishService;
import com.example.sky.vo.DishVo;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/dish")
public class DishController {
    private final DishService dishService;

    @GetMapping("/page")
    public Result<PageResult<DishVo>> dishPage(@Valid DishPageDto query) {
        return Result.success(PageResult.of(dishService.dishPageService(query)));
    }

    @GetMapping("/{id}")
    public Result<DishVo> getDish(@PathVariable Long id) {
        return Result.success(dishService.getDishService(id));
    }

    @PostMapping
    public Result<Void> add(@Valid @RequestBody DishSaveDto data) {
        dishService.saveDish(data, false);
        return Result.ok();
    }

    @PutMapping
    public Result<Void> edit(@Valid @RequestBody DishSaveDto data) {
        dishService.saveDish(data, true);
        return Result.ok();
    }

    @PostMapping("/status/{status}")
    public Result<Void> updateStatus(@PathVariable Integer status, @RequestParam Long id) {
        dishService.updateStatus(id, status);
        return Result.ok();
    }

    @DeleteMapping
    public Result<Void> delete(@RequestParam List<Long> ids) {
        dishService.deleteDishs(ids);
        return Result.ok();
    }
}

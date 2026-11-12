package com.example.sky.controller;

import com.example.sky.common.PageResult;
import com.example.sky.common.Result;
import com.example.sky.dto.SetmealPageDto;
import com.example.sky.dto.SetmealSaveDto;
import com.example.sky.service.SetmealService;
import com.example.sky.vo.SetmealVo;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/setmeal")
public class SetmealController {
    private final SetmealService setmealService;

    @GetMapping("/page")
    public Result<PageResult<SetmealVo>> setmealPage(@Valid SetmealPageDto query) {
        return Result.success(PageResult.of(setmealService.setmealPageService(query)));
    }

    @GetMapping("/{id}")
    public Result<SetmealVo> getSetmeal(@PathVariable Long id) {
        return Result.success(setmealService.getSetmealService(id));
    }

    @PostMapping
    public Result<Void> add(@Valid @RequestBody SetmealSaveDto data) {
        setmealService.saveSetmeal(data, false);
        return Result.ok();
    }

    @PutMapping
    public Result<Void> edit(@Valid @RequestBody SetmealSaveDto data) {
        setmealService.saveSetmeal(data, true);
        return Result.ok();
    }

    @PostMapping("/status/{status}")
    public Result<Void> updateStatus(@PathVariable Integer status, @RequestParam Long id) {
        setmealService.updateStatus(id, status);
        return Result.ok();
    }

    @DeleteMapping
    public Result<Void> delete(@RequestParam List<Long> ids) {
        setmealService.deleteSetmeals(ids);
        return Result.ok();
    }
}

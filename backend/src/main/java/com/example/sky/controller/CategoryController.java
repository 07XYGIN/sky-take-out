package com.example.sky.controller;

import com.example.sky.common.PageResult;
import com.example.sky.common.Result;
import com.example.sky.dto.CategoryPageDto;
import com.example.sky.dto.CategorySaveDto;
import org.springframework.web.bind.annotation.*;
import com.example.sky.service.CategoryService;
import com.example.sky.vo.CategoryVo;
import com.github.pagehelper.PageInfo;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/category")
public class CategoryController {
    private final CategoryService categoryService;

    @PostMapping
    public Result<Void> add(@Valid @RequestBody CategorySaveDto data) {
        categoryService.saveCategory(data, false);
        return Result.ok();
    }

    @PutMapping
    public Result<Void> edit(@Valid @RequestBody CategorySaveDto data) {
        categoryService.saveCategory(data, true);
        return Result.ok();
    }

    @DeleteMapping
    public Result<Void> delete(@RequestParam Long id) {
        categoryService.deleteCategory(id);
        return Result.ok();
    }

    @PostMapping("/status/{status}")
    public Result<Void> updateStatus(@PathVariable Integer status, @RequestParam Long id) {
        categoryService.updateStatus(id, status);
        return Result.ok();
    }

    @GetMapping("/page")
    public Result<PageResult<CategoryVo>> categoryPage(@Valid CategoryPageDto category) {
        PageInfo<CategoryVo> pageInfo = categoryService.categoryPageService(category);
        return Result.success(PageResult.of(pageInfo));
    }

    @GetMapping("/list")
    public Result<List<CategoryVo>> categoryList(@RequestParam(required = false) Integer type) {
        return Result.success(categoryService.categoryListService(type));
    }
}

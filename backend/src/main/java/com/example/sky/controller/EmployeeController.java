package com.example.sky.controller;

import com.example.sky.common.PageResult;
import com.example.sky.common.Result;
import com.example.sky.dto.EmployeePageDto;
import com.example.sky.dto.EmployeeEditDto;
import org.springframework.web.bind.annotation.*;
import com.example.sky.dto.employeeDto;
import com.example.sky.service.EmployeeService;
import com.example.sky.service.userService;
import com.example.sky.vo.EmployeeProfileVo;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Log4j2
@RestController
@RequiredArgsConstructor
public class EmployeeController {
    private final userService userService;
    private final EmployeeService employeeService;

    @GetMapping("/employee/{id}")
    public Result<EmployeeProfileVo> getEmployee(@PathVariable Long id) {
        return Result.success(employeeService.getById(id));
    }

    @PutMapping("/employee")
    public Result<Void> editEmployee(@Validated @RequestBody EmployeeEditDto data) {
        employeeService.editEmployee(data);
        return Result.ok();
    }

    @PostMapping("/employee/status/{status}")
    public Result<Void> updateStatus(@PathVariable Integer status, @RequestParam Long id) {
        employeeService.updateStatus(id, status);
        return Result.ok();
    }

    @GetMapping("/employee/page")
    public Result<PageResult<EmployeeProfileVo>> getEmployeePage(@Validated EmployeePageDto employee) {
        PageInfo<EmployeeProfileVo> pageInfo = employeeService.employeePageService(employee);
        PageResult<EmployeeProfileVo> pageResult = PageResult.of(pageInfo);
        return Result.success(pageResult);
    }

    @PostMapping("/employee")
    public Result<EmployeeProfileVo> createEmployee(@Validated @RequestBody employeeDto employeeDto) {
        userService.registerService(employeeDto);
        return Result.ok();
    }
}

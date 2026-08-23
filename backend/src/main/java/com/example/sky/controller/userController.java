package com.example.sky.controller;

import com.example.sky.common.Result;
import com.example.sky.dto.employeeDto;
import com.example.sky.dto.employeeLoginDto;
import com.example.sky.service.userService;
import com.example.sky.vo.EmployeeLoginVo;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/employee")
@RequiredArgsConstructor
public class userController {
    private final userService userService;

    @PostMapping("/register")
    public Result<?> register(@Valid @RequestBody employeeDto empDto) {
        userService.registerService(empDto);
        return Result.ok();
    }

    @PostMapping("/login")
    public Result<EmployeeLoginVo> login(@Valid @RequestBody employeeLoginDto loginDto) {
        return Result.success(userService.loginService(loginDto));
    }
}

package com.example.sky.controller;

import com.example.sky.common.AuthTokenUtil;
import com.example.sky.common.Result;
import com.example.sky.dto.EmployeeCancelDto;
import com.example.sky.dto.EmployeePasswordDto;
import com.example.sky.dto.employeeDto;
import com.example.sky.dto.employeeLoginDto;
import com.example.sky.service.userService;
import com.example.sky.vo.EmployeeLoginVo;
import com.example.sky.vo.EmployeeProfileVo;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
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

    @GetMapping("/me")
    public Result<EmployeeProfileVo> profile(Authentication authentication) {
        return Result.success(userService.getProfileService(authentication.getName()));
    }

    @PostMapping("/logout")
    public Result<Void> logout(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization
    ) {
        userService.logoutService(AuthTokenUtil.resolveBearerToken(authorization));
        return Result.ok();
    }

    @PostMapping("/cancel")
    public Result<Void> cancel(
            @Valid @RequestBody EmployeeCancelDto cancelDto,
            Authentication authentication,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization
    ) {
        userService.cancelService(
                authentication.getName(),
                cancelDto,
                AuthTokenUtil.resolveBearerToken(authorization)
        );
        return Result.ok();
    }

    @PutMapping("/password")
    public Result<Void> changePassword(
            @Valid @RequestBody EmployeePasswordDto passwordDto,
            Authentication authentication,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization
    ) {
        userService.changePasswordService(
                authentication.getName(),
                passwordDto,
                AuthTokenUtil.resolveBearerToken(authorization)
        );
        return Result.ok();
    }
}

package com.example.sky.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class employeeDto {
    @NotBlank(message = "姓名不能为空")
    private String name;

    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;

    private String phone;

    private String sex;

    private String idNumber;
}

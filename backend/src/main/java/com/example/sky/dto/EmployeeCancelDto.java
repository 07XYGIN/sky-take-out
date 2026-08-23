package com.example.sky.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EmployeeCancelDto {
    @NotBlank(message = "请输入当前密码")
    private String password;
}

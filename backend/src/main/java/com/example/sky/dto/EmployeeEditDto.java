package com.example.sky.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class EmployeeEditDto {
    @NotNull(message = "员工ID不能为空")
    private Long id;
    @NotBlank(message = "姓名不能为空")
    @Size(max = 32)
    private String name;
    private String phone;
    private String password;
}

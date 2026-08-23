package com.example.sky.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeLoginVo {
    private String token;
    private EmployeeUserVo user;
    private String name;
}

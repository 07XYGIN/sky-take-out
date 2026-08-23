package com.example.sky.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeLoginVo {
    private String token;
    private EmployeeUserVo user;
    private List<String> roles;
    private String name;
}

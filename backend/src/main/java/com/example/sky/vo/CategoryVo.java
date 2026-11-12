package com.example.sky.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CategoryVo {
    private Long id;
    private String name;
    private Integer type;
    private Integer sort;
    private Integer status;
    private LocalDateTime createTime;
}

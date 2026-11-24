package com.example.sky.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MiniappSetmealDishVo {
    private Long id;
    private String name;
    private String image;
    private String description;
    private BigDecimal price;
    private Integer copies;
}

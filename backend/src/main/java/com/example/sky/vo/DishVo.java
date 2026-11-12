package com.example.sky.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DishVo {
    private Long id;
    private String name;
    private Long categoryId;
    private String categoryName;
    private BigDecimal price;
    private String image;
    private String description;
    private Integer status;
    private LocalDateTime updateTime;
}

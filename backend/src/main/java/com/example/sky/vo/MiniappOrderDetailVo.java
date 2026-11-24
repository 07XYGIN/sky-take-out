package com.example.sky.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MiniappOrderDetailVo {
    private Long id;
    private Long orderId;
    private Long dishId;
    private Long setmealId;
    private String name;
    private String image;
    private String dishFlavor;
    private Integer number;
    private BigDecimal amount;
}

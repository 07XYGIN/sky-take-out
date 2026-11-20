package com.example.sky.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MiniappShopingCartVo {
    private Long id;
    private String name = "";
    private String image = "";
    private BigDecimal amount = BigDecimal.ZERO;
    private Integer number = 0;
    private String dishFlavor = "";
    private Long dishId;
    private Long setmealId;
}

package com.example.sky.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MiniappShopVo {
    private Long shopId;
    private String shopName;
    private String image;
    private String description;
    private String shopAddress;
    private String phone;
    private Integer status;
    private BigDecimal deliveryFee;
    private BigDecimal packPrice;
}

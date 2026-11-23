package com.example.sky.vo;

import lombok.Data;
import lombok.experimental.Accessors;

import java.math.BigDecimal;

@Data
@Accessors(chain = true)
public class MiniappShopingCartVo {
    private Long id;
    private String name = "";
    private String image = "";
    private BigDecimal amount = BigDecimal.ZERO;
    private Integer number = 0;
    private String dishFlavor = "";
    private Long dishId;
    private Long setmealId;
    private Long userId;
}

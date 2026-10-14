package com.example.sky.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class BusinessWewestVo {
    private int  status;
    private String number;
    private BigDecimal amount;
    private String userName;
    private String orderTime;
    private String Id;
}

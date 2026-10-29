package com.example.sky.vo;


import lombok.Data;

@Data
public class conditionSearchTabVo {
    private Integer allOrders;
    private Integer waiting;
    private Integer confirmed;
    private Integer delivering;
    private Integer completed;
    private Integer cancelled;

}

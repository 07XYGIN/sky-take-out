package com.example.sky.vo;

import lombok.Data;

@Data
public class BusinessVo {
    private int amount;
    private int status;
    private int avgAmount;
    private int waitingOrders;
    private int deliveredOrders;
    private int completedOrders;
    private int cancelledOrders;
}

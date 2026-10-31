package com.example.sky.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderDetailVO {

    private String orderId;

    private Integer orderStatus;

    private String userName;

    private String phone;

    private String address;

    private BigDecimal amount;

    private Integer tablewareNumber;

    private LocalDateTime orderTime;

    private LocalDateTime estimatedDeliveryTime;

    private String cancelReason;

    private String orderDishes;

    private String remake;
}
package com.example.sky.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderVo {

    private String number;

    private Integer status;

    private String consignee;

    private String phone;

    private String address;

    private String orderDishes;

    private BigDecimal amount;

    private Integer tablewareNumber;

    private LocalDateTime orderTime;

    private LocalDateTime estimatedDeliveryTime;

    private String cancelReason;

    private String rejectionReason;

    private String remark;

}
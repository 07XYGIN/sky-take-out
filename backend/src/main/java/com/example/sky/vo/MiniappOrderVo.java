package com.example.sky.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class MiniappOrderVo {
    private Long id;
    private Long userId;
    private Long addressBookId;
    private Long shopId;
    private String shopName;
    private String shopTelephone;
    private String number;
    private Integer status;
    private Integer payStatus;
    private Integer payMethod;
    private BigDecimal amount;
    private BigDecimal packAmount;
    private BigDecimal deliveryFee;
    private String consignee;
    private String sex;
    private String phone;
    private String address;
    private String remark;
    private String cancelReason;
    private String rejectionReason;
    private Integer deliveryStatus;
    private Integer tablewareNumber;
    private Integer tablewareStatus;
    private Integer reminderCount;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime reminderTime;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime orderTime;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime checkoutTime;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime cancelTime;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime estimatedDeliveryTime;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime deliveryTime;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime payDeadline;
    private List<MiniappOrderDetailVo> orderDetailList = new ArrayList<>();
}

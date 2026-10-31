package com.example.sky.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CancelOrder {
    @NotNull(message = "订单号不能为空")
    private String id;
    @NotNull(message = "订单取消原因不能为空")
    private String cancelReason;
}

package com.example.sky.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ConfirmOrder {
    @NotNull(message = "订单号不能为空")
    private String id;
}

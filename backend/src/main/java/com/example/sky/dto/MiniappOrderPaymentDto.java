package com.example.sky.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MiniappOrderPaymentDto {
    @NotBlank(message = "订单号不能为空")
    @Size(max = 50)
    private String orderNumber;
}

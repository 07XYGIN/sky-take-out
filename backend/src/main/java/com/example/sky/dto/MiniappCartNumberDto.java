package com.example.sky.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class MiniappCartNumberDto {
    @NotNull(message = "购物车记录ID不能为空")
    @Positive(message = "购物车记录ID必须大于0")
    private Long id;
    @NotNull(message = "数量不能为空")
    @Min(value = 0, message = "数量不能小于0")
    private Integer number;
}

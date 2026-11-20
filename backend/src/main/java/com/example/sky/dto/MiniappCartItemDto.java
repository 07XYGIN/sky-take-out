package com.example.sky.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MiniappCartItemDto {
    @Positive(message = "菜品ID必须大于0")
    private Long dishId;
    @Positive(message = "套餐ID必须大于0")
    private Long setmealId;
    @Size(max = 50, message = "口味不能超过50个字符")
    private String dishFlavor;
}

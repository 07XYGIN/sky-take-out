package com.example.sky.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class MiniappAddressDefaultDto {
    @NotNull(message = "地址ID不能为空")
    @Positive(message = "地址ID必须大于0")
    private Long id;
}

package com.example.sky.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MiniappOrderPageDto {
    @NotNull
    @Min(1)
    private Integer page = 1;
    @NotNull
    @Min(1)
    @Max(100)
    private Integer pageSize = 10;
    @Min(1)
    @Max(7)
    private Integer status;
    @Min(0)
    @Max(2)
    private Integer payStatus;
}

package com.example.sky.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class SetmealPageDto {
    @Min(1)
    private Integer page = 1;
    @Min(1)
    private Integer pageSize = 10;
    private String name;
    private Long categoryId;
}

package com.example.sky.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class OrderDto {
    private Integer  number;
    private String  phone;
    private String beginTime;
    private String endTime;
    @Builder.Default
    private Integer page = 1;
    @Builder.Default
    private Integer pageSize = 10;
}

package com.example.sky.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class OrderDto {
    @Builder.Default
    private Integer page = 1;
    @Builder.Default
    private Integer pageSize = 10;
    private String  number;
    private String  phone;
    private String beginTime;
    private String endTime;
    private String status;
}

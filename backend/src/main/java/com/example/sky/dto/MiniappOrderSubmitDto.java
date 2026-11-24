package com.example.sky.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MiniappOrderSubmitDto {
    @NotNull(message = "请选择收货地址")
    @Positive
    private Long addressBookId;
    @NotNull(message = "请选择店铺")
    @Positive
    private Long shopId;
    @Size(max = 100, message = "备注不能超过100个字符")
    private String remark;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime estimatedDeliveryTime;
    @NotNull
    @Min(0)
    @Max(1)
    private Integer deliveryStatus = 1;
    @NotNull
    @Min(0)
    @Max(1)
    private Integer tablewareStatus = 0;
    @NotNull
    @Min(0)
    @Max(100)
    private Integer tablewareNumber = 0;
}

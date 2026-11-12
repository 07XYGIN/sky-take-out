package com.example.sky.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class SetmealSaveDto {
    private Long id;
    @NotBlank(message = "名称不能为空")
    @Size(max = 32, message = "名称不能超过32个字符")
    private String name;
    @NotNull(message = "请选择分类")
    private Long categoryId;
    @NotNull(message = "价格不能为空")
    @DecimalMin(value = "0", message = "价格不能小于0")
    @Digits(integer = 8, fraction = 2, message = "价格最多保留两位小数")
    private BigDecimal price;
    @Size(max = 255)
    private String image;
    @Size(max = 255)
    private String description;
    @Min(0)
    @Max(1)
    private Integer status = 1;
}

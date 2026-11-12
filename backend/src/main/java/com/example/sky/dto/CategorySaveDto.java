package com.example.sky.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CategorySaveDto {
    private Long id;
    @NotBlank(message = "分类名称不能为空")
    @Size(max = 32)
    private String name;
    @NotNull(message = "请选择分类类型")
    @Min(1)
    @Max(2)
    private Integer type;
    @NotNull(message = "排序不能为空")
    @Min(0)
    private Integer sort;
    @Min(0)
    @Max(1)
    private Integer status = 1;
}

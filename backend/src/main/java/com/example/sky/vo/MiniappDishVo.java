package com.example.sky.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class MiniappDishVo {

    private Long id;

    private String name;

    private BigDecimal price;

    private String image;

    private String description;

    private List<MiniappDishFlavorVo> flavors = new ArrayList<>();

    private String monthlySales = "";
}

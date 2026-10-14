package com.example.sky.controller;

import com.example.sky.common.Result;
import com.example.sky.service.OrderService;
import com.example.sky.vo.BusinessDataVo;
import com.example.sky.vo.BusinessStateVo;
import com.example.sky.vo.BusinessVo;
import com.example.sky.vo.BusinessWewestVo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/workspace")
public class OrderController {
    private final OrderService orderService;

    @GetMapping("/businessData")
    public Result<BusinessVo> BusinessData() {
        return Result.success(orderService.BusinessService());
    }

    @GetMapping("/businessDataEcharts")
    public Result<BusinessDataVo[]> BusinessDataCharts() {
        return Result.success(orderService.BusinessDataService());
    }

    @GetMapping("/overviewDishes")
    public Result<BusinessWewestVo[]> OverviewDishes() {return Result.success(orderService.BusinessWewestService()); }

    @GetMapping("/businessStatus")
    public Result<BusinessStateVo> BussinessStatus() {return Result.success(orderService.BusinessStateService());}
}

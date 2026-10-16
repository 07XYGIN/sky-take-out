package com.example.sky.controller;

import com.example.sky.common.Result;
import com.example.sky.dto.DataStatisticsDto;
import com.example.sky.service.OrderService;
import com.example.sky.vo.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

@Log4j2
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

    @GetMapping("/report/turnoverStatistics")
    public Result<dataStatisticsVo[]> ReportTurnoverStatistics(
            @RequestParam("beginTime") @DateTimeFormat(pattern = "yyyy-MM-dd") String beginTime,
            @RequestParam("endTime") @DateTimeFormat(pattern = "yyyy-MM-dd") String endTime) {
        log.info("beginTime={}, endTime={}", beginTime, endTime);
        return Result.success(orderService.dataStatisticsService(beginTime, endTime));
    }
}

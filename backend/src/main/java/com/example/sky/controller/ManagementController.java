package com.example.sky.controller;

import com.example.sky.common.PageResult;
import com.example.sky.common.Result;
import com.example.sky.dto.OrderDto;
import com.example.sky.service.OrderService;
import com.example.sky.vo.OrderVo;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Log4j2
@RestController
@RequiredArgsConstructor
@RequestMapping("/order")
public class ManagementController {
    private final OrderService orderServices;
    @GetMapping("/conditionSearch")
    public Result<?> GetManagementList(
            OrderDto order) {
        PageInfo<OrderVo> pageInfo = orderServices.OrderService(order);
        PageResult<OrderVo> pageResult = PageResult.of(pageInfo);
        return Result.success(pageResult);
    }
}

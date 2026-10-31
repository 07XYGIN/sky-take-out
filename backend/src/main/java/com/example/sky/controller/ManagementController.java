package com.example.sky.controller;

import com.example.sky.common.PageResult;
import com.example.sky.common.Result;
import com.example.sky.dto.CancelOrder;
import com.example.sky.dto.OrderDto;
import com.example.sky.exception.BusinessException;
import com.example.sky.service.OrderService;
import com.example.sky.vo.OrderVo;
import com.example.sky.vo.conditionSearchTabVo;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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
    };

    @GetMapping("/statistics")
    public Result<conditionSearchTabVo> GetManagementTab(){
        return Result.success(orderServices.conditionSearchTabService());
    }

    @PutMapping("/cancel")
    public Result<?> cancelOrder(@Validated @RequestBody CancelOrder cancel) {
       int result =  orderServices.cancelOrderService(cancel.getId(),cancel.getCancelReason());
        if(result == 0){
            throw new BusinessException(500, "发生未知错误，更新失败");
        }
       return Result.ok();
    }
}

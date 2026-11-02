package com.example.sky.controller;

import com.example.sky.common.PageResult;
import com.example.sky.common.Result;
import com.example.sky.dto.CancelOrder;
import com.example.sky.dto.ConfirmOrder;
import com.example.sky.dto.OrderDto;
import com.example.sky.service.OrderService;
import com.example.sky.vo.OrderDetailVO;
import com.example.sky.vo.OrderVo;
import com.example.sky.vo.conditionSearchTabVo;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
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

    @PutMapping("/confirm")
    public Result<?> confirmOrder(@Validated @RequestBody ConfirmOrder order) {
        orderServices.updateOrderStatusService(order.getId(), 3, null);
        return Result.ok();
    }

    @PutMapping("/cancel")
    public Result<?> cancelOrder(@Validated @RequestBody CancelOrder cancel) {
       orderServices.updateOrderStatusService(cancel.getId(), 6, cancel.getCancelReason());
       return Result.ok();
    }

    @PutMapping("/delivery/{number}")
    public Result<?> deliverOrder(@PathVariable String number) {
        orderServices.updateOrderStatusService(number, 4, null);
        return Result.ok();
    }

    @PutMapping("/complete/{number}")
    public Result<?> completeOrder(@PathVariable String number) {
        orderServices.updateOrderStatusService(number, 5, null);
        return Result.ok();
    }
    @PutMapping("/rejection")
    public Result<?> rejectionOrder(@Validated @RequestBody CancelOrder cancel) {
        orderServices.updateOrderStatusService(cancel.getId(), 6, cancel.getCancelReason());
        return Result.ok();
    }
    @GetMapping("/details/{orderId}")
    public Result<OrderDetailVO> orderDetail(@PathVariable String orderId){
        return Result.success(orderServices.orderDetailService(orderId));
    }

}

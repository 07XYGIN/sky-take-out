package com.example.sky.service;

import com.example.sky.common.PageResult;
import com.example.sky.dto.DataStatisticsDto;
import com.example.sky.dto.OrderDto;
import com.example.sky.exception.BusinessException;
import com.example.sky.mapper.OrderMapper;
import com.example.sky.vo.*;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor

public class OrderService {
    private final OrderMapper orderMapper;
    private final MiniappService miniappService;
    public BusinessVo BusinessService() {
        return orderMapper.BusinessData();
    };
    public BusinessDataVo[] BusinessDataService() {
        return orderMapper.echartsBusiness();
    }
    public BusinessWewestVo[] BusinessWewestService() {return orderMapper.BusinessWewest();}
    public BusinessStateVo BusinessStateService() {return orderMapper.BusinessState();}
    public dataStatisticsVo[] dataStatisticsService(String beginTime, String endTime) {
        return orderMapper.dataStatistics(beginTime, endTime);
    }
    public PageInfo<OrderVo> OrderService(OrderDto order) {
        PageHelper.startPage(order.getPage(), order.getPageSize());
        List<OrderVo> orderList = orderMapper.SelectOrderList(order);
        return new PageInfo<>(orderList);
    }
    public conditionSearchTabVo conditionSearchTabService(){
        return orderMapper.conditionSearchTab();
    }
    public int updateOrderStatusService(String number, int status, String cancelReason) {
        Long userId = orderMapper.orderUserIdMapper(number);
        int result = orderMapper.updateOrderStatus(number, status, cancelReason);
        if (result == 0) {
            throw new BusinessException(500, "发生未知错误，更新失败");
        }
        // 管理端接单、配送、完成或取消后，删除该用户的小程序历史订单缓存。
        if (userId != null) {
            miniappService.deleteOrderHistoryCache(userId);
        }
        return result;
    }
    public OrderDetailVO orderDetailService(String orderId){
        return orderMapper.orderDetail(orderId);
    }
}

package com.example.sky.service;

import com.example.sky.common.PageResult;
import com.example.sky.dto.DataStatisticsDto;
import com.example.sky.dto.OrderDto;
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
}

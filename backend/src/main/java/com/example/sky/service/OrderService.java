package com.example.sky.service;

import com.example.sky.dto.DataStatisticsDto;
import com.example.sky.mapper.OrderMapper;
import com.example.sky.vo.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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
}

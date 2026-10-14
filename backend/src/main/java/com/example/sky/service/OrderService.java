package com.example.sky.service;

import com.example.sky.mapper.OrderMapper;
import com.example.sky.vo.BusinessDataVo;
import com.example.sky.vo.BusinessStateVo;
import com.example.sky.vo.BusinessVo;
import com.example.sky.vo.BusinessWewestVo;
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
}

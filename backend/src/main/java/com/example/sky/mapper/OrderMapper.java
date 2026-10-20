package com.example.sky.mapper;

import com.example.sky.dto.OrderDto;
import com.example.sky.vo.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OrderMapper {
    BusinessVo BusinessData();
    BusinessDataVo[] echartsBusiness();
    BusinessWewestVo[] BusinessWewest();
    BusinessStateVo BusinessState();
    dataStatisticsVo[] dataStatistics(@Param("beginTime") String beginTime , @Param("endTime") String endTime);
    List<OrderVo> SelectOrderList(OrderDto orderDto);
}

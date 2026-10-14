package com.example.sky.mapper;

import com.example.sky.vo.BusinessDataVo;
import com.example.sky.vo.BusinessStateVo;
import com.example.sky.vo.BusinessVo;
import com.example.sky.vo.BusinessWewestVo;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OrderMapper {
    BusinessVo BusinessData();
    BusinessDataVo[] echartsBusiness();
    BusinessWewestVo[] BusinessWewest();
    BusinessStateVo BusinessState();
}

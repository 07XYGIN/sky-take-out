package com.example.sky.service;

import com.example.sky.dto.EmployeePageDto;
import com.example.sky.mapper.EmployeeMapper;
import com.example.sky.vo.EmployeeProfileVo;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    private final EmployeeMapper employeeMapper;

    public PageInfo<EmployeeProfileVo> employeePageService(EmployeePageDto employee) {
        PageHelper.startPage(employee.getPage(), employee.getPageSize());
        List<EmployeeProfileVo> employeeList = employeeMapper.selectEmployeeList(employee);
        return new PageInfo<>(employeeList);
    }
}

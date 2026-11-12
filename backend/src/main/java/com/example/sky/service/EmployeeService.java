package com.example.sky.service;

import com.example.sky.dto.EmployeePageDto;
import com.example.sky.dto.EmployeeEditDto;
import com.example.sky.common.PasswordUtil;
import com.example.sky.exception.BusinessException;
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
    private final PasswordUtil passwordUtil;

    public EmployeeProfileVo getById(Long id) {
        EmployeeProfileVo employee = employeeMapper.getById(id);
        if (employee == null) {
            throw new BusinessException(404, "员工不存在");
        }
        return employee;
    }

    public void editEmployee(EmployeeEditDto data) {
        getById(data.getId());
        data.setName(data.getName().trim());
        if (data.getPassword() != null && !data.getPassword().isBlank()) {
            data.setPassword(passwordUtil.encode(data.getPassword()));
        } else {
            data.setPassword(null);
        }
        if (employeeMapper.updateEmployee(data) == 0) {
            throw new BusinessException(404, "员工不存在");
        }
    }

    public void updateStatus(Long id, Integer status) {
        if (status == null || (status != 0 && status != 1)) {
            throw new BusinessException(400, "状态只能为0或1");
        }
        if (employeeMapper.updateStatus(id, status) == 0) {
            throw new BusinessException(404, "员工不存在");
        }
    }

    public PageInfo<EmployeeProfileVo> employeePageService(EmployeePageDto employee) {
        PageHelper.startPage(employee.getPage(), employee.getPageSize());
        List<EmployeeProfileVo> employeeList = employeeMapper.selectEmployeeList(employee);
        return new PageInfo<>(employeeList);
    }
}

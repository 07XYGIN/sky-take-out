package com.example.sky.service;

import com.example.sky.common.JwtUtil;
import com.example.sky.common.PasswordUtil;
import com.example.sky.common.SnowflakeIdGenerator;
import com.example.sky.dto.employeeDto;
import com.example.sky.dto.employeeLoginDto;
import com.example.sky.entity.Employee;
import com.example.sky.exception.BusinessException;
import com.example.sky.mapper.EmployeeMapper;
import com.example.sky.vo.EmployeeLoginVo;
import com.example.sky.vo.EmployeeUserVo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class userService {
    private final EmployeeMapper employeeMapper;
    private final PasswordUtil passwordUtil;
    private final JwtUtil jwtUtil;
    private final SnowflakeIdGenerator snowflakeIdGenerator;

    @Transactional
    public void registerService(employeeDto empDto) {
        String username = empDto.getUsername().trim();
        if (employeeMapper.findByUsername(username) != null) {
            throw new BusinessException(409, "用户名已存在");
        }

        LocalDateTime now = LocalDateTime.now();
        Employee employee = new Employee();
        employee.setId(snowflakeIdGenerator.nextId());
        employee.setName(empDto.getName().trim());
        employee.setUsername(username);
        employee.setPassword(passwordUtil.encode(empDto.getPassword()));
        employee.setPhone(empDto.getPhone().trim());
        employee.setSex(empDto.getSex());
        employee.setIdNumber(empDto.getIdNumber().toUpperCase());
        employee.setStatus(1);
        employee.setCreateTime(now);
        employee.setUpdateTime(now);

        try {
            employeeMapper.insert(employee);
        } catch (DuplicateKeyException e) {
            // 查询和插入之间仍可能发生并发注册，最终以数据库唯一索引为准。
            throw new BusinessException(409, "用户名已存在");
        }
    }

    public EmployeeLoginVo loginService(employeeLoginDto loginDto) {
        String username = loginDto.getUsername().trim();
        Employee employee = employeeMapper.findByUsername(username);
        if (employee == null || !matchesPassword(loginDto.getPassword(), employee)) {
            throw new BusinessException(401, "用户名或密码错误");
        }
        if (employee.getStatus() != null && employee.getStatus() != 1) {
            throw new BusinessException(403, "账号已被禁用");
        }

        String token = jwtUtil.generateToken(employee.getUsername());
        EmployeeUserVo user = new EmployeeUserVo(
                employee.getId(),
                employee.getUsername(),
                employee.getName()
        );
        return new EmployeeLoginVo(token, user, List.of("EMPLOYEE"), employee.getName());
    }

    private boolean matchesPassword(String rawPassword, Employee employee) {
        String storedPassword = employee.getPassword();
        if (storedPassword == null) {
            return false;
        }
        return passwordUtil.matches(rawPassword, storedPassword);
    }
}

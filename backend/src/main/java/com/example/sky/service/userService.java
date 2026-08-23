package com.example.sky.service;

import com.example.sky.common.JwtUtil;
import com.example.sky.common.MaskUtil;
import com.example.sky.common.PasswordUtil;
import com.example.sky.common.SnowflakeIdGenerator;
import com.example.sky.common.TokenBlacklistService;
import com.example.sky.dto.EmployeeCancelDto;
import com.example.sky.dto.EmployeePasswordDto;
import com.example.sky.dto.employeeDto;
import com.example.sky.dto.employeeLoginDto;
import com.example.sky.entity.Employee;
import com.example.sky.exception.BusinessException;
import com.example.sky.mapper.EmployeeMapper;
import com.example.sky.vo.EmployeeLoginVo;
import com.example.sky.vo.EmployeeProfileVo;
import com.example.sky.vo.EmployeeUserVo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
@Slf4j
@Service
@RequiredArgsConstructor
public class userService {
    private final EmployeeMapper employeeMapper;
    private final PasswordUtil passwordUtil;
    private final JwtUtil jwtUtil;
    private final SnowflakeIdGenerator snowflakeIdGenerator;
    private final TokenBlacklistService tokenBlacklistService;

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
        return new EmployeeLoginVo(token, user, employee.getName());
    }

    public EmployeeProfileVo getProfileService(String username) {
        Employee employee = findEnabledEmployee(username);
        return new EmployeeProfileVo(
                employee.getId(),
                employee.getUsername(),
                employee.getName(),
                MaskUtil.maskPhone(employee.getPhone()),
                employee.getSex(),
                MaskUtil.maskIdNumber(employee.getIdNumber()),
                employee.getStatus(),
                employee.getCreateTime(),
                employee.getUpdateTime()
        );
    }

    public void logoutService(String token) {
        tokenBlacklistService.invalidate(token);
    }

    @Transactional
    public void cancelService(String username, EmployeeCancelDto cancelDto, String token) {
        Employee employee = findEnabledEmployee(username);
        if (!passwordUtil.matches(cancelDto.getPassword(), employee.getPassword())) {
            throw new BusinessException(400, "当前密码错误");
        }

        if (employeeMapper.updateStatus(employee.getId(), 0) != 1) {
            throw new BusinessException(500, "账号注销失败");
        }
        tokenBlacklistService.invalidate(token);
    }

    @Transactional
    public void changePasswordService(
            String username,
            EmployeePasswordDto passwordDto,
            String token
    ) {
        Employee employee = findEnabledEmployee(username);
        if (!passwordUtil.matches(passwordDto.getOldPassword(), employee.getPassword())) {
            throw new BusinessException(400, "旧密码错误");
        }
        if (passwordUtil.matches(passwordDto.getNewPassword(), employee.getPassword())) {
            throw new BusinessException(400, "新密码不能与旧密码相同");
        }

        int updated = employeeMapper.updatePassword(
                employee.getId(),
                passwordUtil.encode(passwordDto.getNewPassword())
        );
        if (updated != 1) {
            throw new BusinessException(500, "密码修改失败");
        }
        tokenBlacklistService.invalidate(token);
    }

    private boolean matchesPassword(String rawPassword, Employee employee) {
        String storedPassword = employee.getPassword();
        if (storedPassword == null) {
            return false;
        }
        return passwordUtil.matches(rawPassword, storedPassword);
    }

    private Employee findEnabledEmployee(String username) {
        Employee employee = employeeMapper.findByUsername(username);
        if (employee == null) {
            throw new BusinessException(401, "账号不存在或登录状态已失效");
        }
        if (employee.getStatus() == null || employee.getStatus() != 1) {
            throw new BusinessException(403, "账号已被注销或禁用");
        }
        return employee;
    }
}

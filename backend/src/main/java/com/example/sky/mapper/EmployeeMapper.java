package com.example.sky.mapper;

import com.example.sky.dto.EmployeePageDto;
import com.example.sky.entity.Employee;
import com.example.sky.vo.EmployeeProfileVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EmployeeMapper {
    List<EmployeeProfileVo> selectEmployeeList(EmployeePageDto employee);

    Employee findByUsername(@Param("username") String username);

    Integer findStatusByUsername(@Param("username") String username);

    int insert(Employee employee);

    int updatePassword(@Param("id") Long id, @Param("password") String password);

    int updateStatus(@Param("id") Long id, @Param("status") Integer status);
}

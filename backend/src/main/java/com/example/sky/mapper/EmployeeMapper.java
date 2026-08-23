package com.example.sky.mapper;

import com.example.sky.entity.Employee;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EmployeeMapper {
    Employee findByUsername(@Param("username") String username);

    int insert(Employee employee);

    int updatePassword(@Param("id") Long id, @Param("password") String password);
}

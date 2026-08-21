package com.example.corelearning;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.example.corelearning.mapper")
public class CoreLearningApplication {
    public static void main(String[] args) {
        SpringApplication.run(CoreLearningApplication.class, args);
    }
}

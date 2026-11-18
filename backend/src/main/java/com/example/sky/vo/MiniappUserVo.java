package com.example.sky.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
public class MiniappUserVo {
    private Long id;
    private String openid;
    private String idNumber;
    /**
     * 姓名
     */
    private String name;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 性别
     */
    private String sex;

    /**
     * 头像
     */
    private String avatar;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

}

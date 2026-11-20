package com.example.sky.vo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MiniappAddressBookVo {
    @Positive(message = "地址ID必须大于0")
    private Long id;
    @NotBlank(message = "收货人不能为空")
    @Size(max = 32, message = "收货人不能超过32个字符")
    private String consignee;
    @NotBlank(message = "性别不能为空")
    @Pattern(regexp = "[01]", message = "性别只能为0或1")
    private String sex;
    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "1[0-9]{10}", message = "手机号格式不正确")
    private String phone;
    @Size(max = 12)
    private String provinceCode;
    @Size(max = 32)
    private String provinceName;
    @Size(max = 12)
    private String cityCode;
    @Size(max = 32)
    private String cityName;
    @Size(max = 12)
    private String districtCode;
    @Size(max = 32)
    private String districtName;
    @NotBlank(message = "详细地址不能为空")
    @Size(max = 200, message = "详细地址不能超过200个字符")
    private String detail;
    @Size(max = 100)
    private String label;
    private Integer isDefault;
}

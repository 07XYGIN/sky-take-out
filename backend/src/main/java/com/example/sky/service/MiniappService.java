package com.example.sky.service;

import com.alibaba.fastjson2.JSONObject;
import com.example.sky.common.JwtUtil;
import com.example.sky.dto.MiniappUserLoginDto;
import com.example.sky.mapper.MiniappUserMapper;
import com.example.sky.vo.MiniappLoginVo;
import com.example.sky.vo.MiniappUserVo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;


@Slf4j
@Service
@RequiredArgsConstructor
public class MiniappService {
    private final RestClient restClient;

    private final MiniappUserMapper userMapper;

    private final JwtUtil jwtUtil;

    private String Wxurl = "https://api.weixin.qq.com/sns/jscode2session";


    @Value("${wx.appid}")
    private String appid;

    @Value("${wx.secret}")
    private String secret;


    public MiniappLoginVo login(MiniappUserLoginDto miniappUserLoginDto){
        String code = miniappUserLoginDto.getCode();
        String response = restClient.get()
                .uri(Wxurl,uriBuilder -> uriBuilder
                        .queryParam("appid", appid)
                        .queryParam("secret", secret)
                        .queryParam("js_code", code)
                        .queryParam("grant_type", "authorization_code")
                        .build())
                .retrieve()
                .body(String.class);
        JSONObject jsonObject = JSONObject.parseObject(response);
        String openid = jsonObject.getString("openid");
        if (openid == null || openid.isEmpty()) {
            throw new RuntimeException("微信登录获取openid失败");
        }

        MiniappUserVo userDb = userMapper.miniappUserByOpenid(openid);
        if (userDb == null) {
            MiniappUserVo newUser = new MiniappUserVo();
            newUser.setOpenid(openid);
            newUser.setCreateTime(LocalDateTime.now());
            userMapper.insertMiniappUser(newUser);
            userDb = userMapper.miniappUserByOpenid(openid);
        }

        String token = jwtUtil.generateToken(openid,"miniapp");
        MiniappLoginVo userInfo = new MiniappLoginVo();
        userDb.setOpenid("*****");
        userInfo.setToken(token);
        userInfo.setUser(userDb);
        return userInfo;
    }

}

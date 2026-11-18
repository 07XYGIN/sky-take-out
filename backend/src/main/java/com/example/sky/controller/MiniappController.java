package com.example.sky.controller;

import com.example.sky.common.Result;
import com.example.sky.dto.MiniappUserLoginDto;
import com.example.sky.service.MiniappService;
import com.example.sky.vo.MiniappLoginVo;
import com.example.sky.vo.MiniappUserVo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/miniapp")
@RequiredArgsConstructor

public class MiniappController {
    private final MiniappService miniappService;

    @PostMapping("/user/login")
    public Result<MiniappLoginVo> MiniappLogin(@RequestBody MiniappUserLoginDto miniappUserLoginDto) {
        MiniappLoginVo result = miniappService.login(miniappUserLoginDto);
        log.info("result==>{}", result);
        return Result.success(result);
    }
}

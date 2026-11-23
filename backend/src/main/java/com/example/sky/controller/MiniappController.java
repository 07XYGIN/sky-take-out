package com.example.sky.controller;

import com.example.sky.common.Result;
import com.example.sky.dto.*;
import com.example.sky.service.CategoryService;
import com.example.sky.service.MiniappService;
import com.example.sky.vo.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/miniapp")
@RequiredArgsConstructor

public class MiniappController {
    private final MiniappService miniappService;
    private final CategoryService categoryService;

    @PostMapping("/user/login")
    public Result<MiniappLoginVo> MiniappLogin(@RequestBody MiniappUserLoginDto miniappUserLoginDto) {
        MiniappLoginVo result = miniappService.login(miniappUserLoginDto);
        log.info("result==>{}", result);
        return Result.success(result);
    }

    @GetMapping("/category/list")
    public Result<List<CategoryVo>> categoryList(@RequestParam(required = false) Integer type) {
        return Result.success(categoryService.categoryListService(type));
    }

    @GetMapping("/dish/list")
    public Result<List<MiniappDishVo>> dishList(@RequestParam String categoryId) {
        return Result.success(miniappService.dishListService(categoryId));
    }

    @GetMapping("/shoppingCart/list")
    public Result<List<MiniappShopingCartVo>> shoppingCartList(Authentication authentication) {
        return Result.success(miniappService.shopingCartService(authentication.getName()));
    }

    @GetMapping("/setmeal/list")
    public Result<List<SetmealVo>> setmealList(@RequestParam Long categoryId) {
        return Result.success(miniappService.setmealListService(categoryId));
    }

    @GetMapping("/dish/flavor/{dishId}")
    public Result<List<MiniappDishFlavorVo>> dishFlavorList(@PathVariable Long dishId) {
        return Result.success(miniappService.dishFlavorListService(dishId));
    }

    @PostMapping("/shoppingCart/sub")
    public Result<Void> subtractCart(@Valid @RequestBody MiniappCartItemDto data, Authentication authentication) {
        miniappService.subtractCartService(authentication.getName(), data);
        return Result.ok();
    }

    @DeleteMapping("/shoppingCart/clean")
    public Result<Void> cleanCart(Authentication authentication) {
        miniappService.cleanCartService(authentication.getName());
        return Result.ok();
    }

    @PutMapping("/shoppingCart")
    public Result<Void> updateCartNumber(@Valid @RequestBody MiniappCartNumberDto data, Authentication authentication) {
        miniappService.updateCartNumberService(authentication.getName(), data);
        return Result.ok();
    }

    @GetMapping("/addressBook/list")
    public Result<List<MiniappAddressBookVo>> addressBookList(Authentication authentication) {
        return Result.success(miniappService.addressBookListService(authentication.getName()));
    }

    @GetMapping("/addressBook/default")
    public Result<MiniappAddressBookVo> defaultAddress(Authentication authentication) {
        return Result.success(miniappService.defaultAddressService(authentication.getName()));
    }

    @GetMapping("/addressBook/{id}")
    public Result<MiniappAddressBookVo> addressBookById(@PathVariable Long id, Authentication authentication) {
        return Result.success(miniappService.addressBookByIdService(authentication.getName(), id));
    }

    @PostMapping("/addressBook")
    public Result<Void> insertAddressBook(@Valid @RequestBody MiniappAddressBookVo data, Authentication authentication) {
        miniappService.insertAddressBookService(authentication.getName(), data);
        return Result.ok();
    }

    @PutMapping("/addressBook")
    public Result<Void> updateAddressBook(@Valid @RequestBody MiniappAddressBookVo data, Authentication authentication) {
        miniappService.updateAddressBookService(authentication.getName(), data);
        return Result.ok();
    }

    @DeleteMapping({"/addressBook", "/addressBook/"})
    public Result<Void> deleteAddressBook(@RequestParam Long id, Authentication authentication) {
        miniappService.deleteAddressBookService(authentication.getName(), id);
        return Result.ok();
    }

    @PutMapping("/addressBook/default")
    public Result<Void> setDefaultAddress(@Valid @RequestBody MiniappAddressDefaultDto data, Authentication authentication) {
        miniappService.setDefaultAddressService(authentication.getName(), data.getId());
        return Result.ok();
    }

    @PutMapping("/order/cancel/{id}")
    public Result<Void> cancelUnpaidOrder(@PathVariable Long id, Authentication authentication) {
        miniappService.cancelUnpaidOrderService(authentication.getName(), id);
        return Result.ok();
    }

    @GetMapping("/shop/status")
    public Result<Integer> shopStatus(@RequestParam(defaultValue = "1") Long shopId) {
        return Result.success(miniappService.shopStatusService(shopId));
    }

    @GetMapping("/shop/getMerchantInfo")
    public Result<MiniappShopVo> getMerchantInfo(@RequestParam(defaultValue = "1") Long shopId) {
        return Result.success(miniappService.getMerchantInfoService(shopId));
    }

    @PostMapping("/shoppingCart/add")
    public Result<?> addshoppingCart(@Valid @RequestBody ShopingCartDto CartData, Authentication authentication) {
        miniappService.addShopCart(authentication.getName(),CartData);
        return Result.ok();
    }
}

package com.example.sky.common;

public final class MaskUtil {
    private MaskUtil() {
    }

    public static String maskPhone(String phone) {
        if (phone == null || phone.length() != 11) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(7);
    }

    public static String maskIdNumber(String idNumber) {
        if (idNumber == null || idNumber.length() != 18) {
            return idNumber;
        }
        return idNumber.substring(0, 6) + "********" + idNumber.substring(14);
    }
}

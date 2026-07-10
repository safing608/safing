package com.safing.backend.common.enumtype;

import com.safing.backend.common.exception.CustomException;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Locale;

/**
 * 사용자가 선택한 기본 국가 코드
 *
 * 실제 비즈니스 의미는 "응답 언어 설정"에 가깝지만,
 * 프론트엔드의 CountryCode 타입과 맞추기 위해 국가 코드로 관리한다.
 */

@Getter
@RequiredArgsConstructor
public enum CountryCode {
    KR("ko"), // 한국어
    US("en"), // 영어
    KH("km"), // 크메르어
    VN("vi"), // 베트남어
    NP("ne"); // 네팔어

    private final String targetLanguage;

    public static CountryCode from(String value) {
        try {
            return CountryCode.valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new CustomException(ResponseCode.UNSUPPORTED_COUNTRY_CODE);
        }
    }

}

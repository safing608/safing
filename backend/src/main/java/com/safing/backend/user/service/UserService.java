package com.safing.backend.user.service;

import com.safing.backend.common.enumtype.CountryCode;
import com.safing.backend.common.enumtype.ResponseCode;
import com.safing.backend.common.exception.CustomException;
import com.safing.backend.user.entity.User;
import com.safing.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * 사용자의 기본 국가 코드를 변경한다
     *
     * @param userId
     * @param countryCodeValue
     */
    @Transactional
    public void updateCountryCode(Long userId, String countryCodeValue) {

        // 1. 문자열을 enum으로 변환
        CountryCode countryCode = CountryCode.from(countryCodeValue);

        // 2. Access Token에서 꺼낸 userId로 사용자 조회
        // 사용자가 없는 경우 인증 실패로 처리
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ResponseCode.UNAUTHORIZED));

        // 3. 사용자 국가 코드 변경
        // @Transactional 안에서 조회한 엔티티는 영속 상태이므로
        // 별도 save() 호출 없이도 변경 감지로  UPDATE 반영
        user.updateCountryCode(countryCode);

    }
}

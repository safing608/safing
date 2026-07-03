package com.safing.backend.user.controller;

import com.safing.backend.common.dto.ApiResponse;
import com.safing.backend.user.dto.request.UpdateCountryCodeRequest;
import com.safing.backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 국가 코드 변경 API
     */
    @PatchMapping("/country-code")
    public ResponseEntity<ApiResponse<Void>> updateCountryCode(
         Authentication authentication,
         @Valid @RequestBody UpdateCountryCodeRequest request
    ){
        Long userId = Long.valueOf(authentication.getName());

        userService.updateCountryCode(userId, request.countryCode());

        return ResponseEntity.ok(
                ApiResponse.success("국가 코드가 변경되었습니다.", null)
        );

    }
}

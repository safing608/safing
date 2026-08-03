package com.safing.backend.chat.repository;

import com.safing.backend.chat.entity.RiskType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RiskTypeRepository extends JpaRepository<RiskType, Long> {

    // AI가 내려준 위험코드로 RiskType 엔티티 조회
    Optional<RiskType> findByRiskTypeCode(String riskTypeCode);
}

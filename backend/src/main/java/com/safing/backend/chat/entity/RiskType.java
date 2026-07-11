package com.safing.backend.chat.entity;

import com.safing.backend.common.enumtype.CountryCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "risk_types",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_risk_types_code", columnNames = "risk_type_code")
        }
)
public class RiskType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "risk_type_id")
    private Long riskTypeId;

    @Column(name = "risk_type_code", nullable = false, length = 20)
    private String riskTypeCode;

    @Column(name = "risk_type_name_ko", nullable = false, length = 100)
    private String riskTypeNameKo;

    @Column(name = "risk_type_name_en", nullable = false, length = 100)
    private String riskTypeNameEn;

    @Column(name = "risk_type_name_ne", nullable = false, length = 100)
    private String riskTypeNameNe;

    @Column(name = "risk_type_name_km", nullable = false, length = 100)
    private String riskTypeNameKm;

    @Column(name = "risk_type_name_vi", nullable = false, length = 100)
    private String riskTypeNameVi;

    // 위험유형 국가별 매핑
    public String getNameByCountryCode(CountryCode countryCode) {
        return switch (countryCode){
            case KR -> riskTypeNameKo;
            case US -> riskTypeNameEn;
            case KH -> riskTypeNameKm;
            case VN -> riskTypeNameVi;
            case NP -> riskTypeNameNe;
        };
    }
}

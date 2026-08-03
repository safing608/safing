# [BE] Java Dockerfile
FROM eclipse-temurin:21-jdk-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 완성된 jar 파일 복사
COPY build/libs/*.jar app.jar

# 8080 포트 사용
EXPOSE 8080

# 스프링 부트를 실행하는 리눅스 자바 명령어 (8080 포트 개방)
ENTRYPOINT ["java", "-jar", "app.jar"]
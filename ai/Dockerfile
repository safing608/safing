# [AI] FastAPI Dockerfile
FROM python:3.11-slim

# 실시간 로그 출력, 불필요한 바이트코드 생성하지 않도록 설정
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# 작업 디렉토리 설정
WORKDIR /app

# requirements.txt 복사 및 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# FastAPI 소스코드를 전부 컨테이너 안으로 복사
COPY . .

# 8000번 포트 사용
EXPOSE 8000

# FastAPI 서버를 구동하는 명령어 (8000 포트 개방)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
package com.safing.backend.chat.service;

import com.safing.backend.chat.dto.sse.CompleteEventData;
import com.safing.backend.chat.dto.sse.ErrorEventData;
import com.safing.backend.chat.dto.sse.RiskTypeEventData;
import com.safing.backend.chat.entity.ChatMessage;
import com.safing.backend.chat.entity.ChatSession;
import com.safing.backend.chat.entity.RiskType;
import com.safing.backend.chat.enumtype.ChatMessageRole;
import com.safing.backend.chat.enumtype.ChatMessageStatus;
import com.safing.backend.chat.repository.ChatMessageRepository;
import com.safing.backend.chat.repository.ChatSessionRepository;
import com.safing.backend.chat.repository.RiskTypeRepository;
import com.safing.backend.common.enumtype.ResponseCode;
import com.safing.backend.common.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import com.safing.backend.chat.dto.sse.MessageEventData;

import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatStreamService {

    private static final Long SSE_TIMEOUT = 60_000L;

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final RiskTypeRepository riskTypeRepository;
    private final ChatMessageCommandService chatMessageCommandService;

    public SseEmitter streamAnswer(Long userId, Long sessionId, Long messageId) {
        // 1. 세션 검증
        ChatSession session = chatSessionRepository
                .findBySessionIdAndUser_UserIdAndDeletedFalse(sessionId, userId)
                .orElseThrow(() -> new CustomException(ResponseCode.SESSION_NOT_FOUND));

        // 2. 메시지 검증
        ChatMessage message = chatMessageRepository
                .findByMessageIdAndSessionAndRole(
                        messageId,
                        session,
                        ChatMessageRole.ASSISTANT
                        )
                .orElseThrow(() -> new CustomException(ResponseCode.MESSAGE_NOT_FOUND));

        // 3. 상태 검증
        if(message.getStatus() != ChatMessageStatus.PROCESSING){
            throw new CustomException(ResponseCode.INVALID_MESSAGE_STATUS);
        }

        // 4. SseEmitter 생성 (60초 타임아웃)
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);

        ExecutorService executor = Executors.newSingleThreadExecutor();

        // 5. 더미 이벤트 추가
        // TODO: AI 서버 연동 전 SSE 흐름 검증용 더미 이벤트
        // TODO: 추후 Spring 관리 Executor 또는 CompletableFuture + 별도 Executor로 변경
        executor.execute(() -> {
            try {
                // 답변 담아둘 builder 생성
                StringBuilder answerBuilder = new StringBuilder();

                String riskTypeCode = "9999";
                String title = "기계 화재 위험 대응";

                RiskType riskType = riskTypeRepository.findByRiskTypeCode(riskTypeCode)
                        .orElseThrow(() -> new CustomException(ResponseCode.RISK_TYPE_NOT_FOUND));

                // 1. riskType 이벤트
                // TODO: 사용자 언어에 따른 riskTypeName 전달
                emitter.send(SseEmitter.event()
                        .name("riskType")
                        .data(new RiskTypeEventData(riskType.getRiskTypeCode(), riskType.getRiskTypeNameKo())));

                // 2. message 이벤트
                String chunk1 = "즉시 작업을 멈추고 ";
                answerBuilder.append(chunk1);
                emitter.send(SseEmitter.event()
                        .name("message")
                        .data(new MessageEventData(chunk1)));

                Thread.sleep(500);

                String chunk2 = "관리자에게 보고하세요.";
                answerBuilder.append(chunk2);
                emitter.send(SseEmitter.event()
                        .name("message")
                        .data(new MessageEventData(chunk2)));


                String answer = answerBuilder.toString();

                // DB 업데이트
                chatMessageCommandService.completeAssistantAnswer(
                        sessionId,
                        messageId,
                        title,
                        riskTypeCode,
                        answer
                );

                // 3. complete 이벤트
                // DB 업데이트가 성공한 이후에는 답변 생성 자체는 완료된 상태이다.
                // 이때 complete 이벤트 전송만 실패했는데 바깥 catch로 흐르게 되면
                // handleStreamError()에서 이미 COMPLETED로 저장된 메시지를 FAILED로 변경할 수 있다.
                // 따라서 complete 이벤트 전송 실패는 별도로 처리하여 DB 상태를 FAILED로 바꾸지 않는다.
                try {
                    emitter.send(SseEmitter.event()
                            .name("complete")
                            .data(new CompleteEventData(
                                    title,
                                    riskType.getRiskTypeCode(),
                                    riskType.getRiskTypeNameKo(),
                                    answer
                            )));

                    emitter.complete(); // 스트림 정상 종료
                } catch (IOException completeSendException) {
                    emitter.completeWithError(completeSendException); // 스트림을 에러 상황으로 종료
                }

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("AI 답변 스트리밍 작업이 인터럽트됨. sessionId={}, messageId={}",
                        sessionId, messageId, e);
                handleStreamError(emitter, sessionId, messageId);

            } catch (Exception  e) {
                log.error("AI 답변 스트리밍 중 예외 발생. sessionId={}, messageId={}",
                        sessionId, messageId, e);

                handleStreamError(emitter, sessionId, messageId);
            } finally {
                executor.shutdown();
            }
        });

        return emitter;
    }

    private void handleStreamError(SseEmitter emitter, Long sessionId, Long messageId) {
        try {
            chatMessageCommandService.failAssistantAnswer(sessionId, messageId);

            emitter.send(SseEmitter.event()
                    .name("error")
                    .data(new ErrorEventData(
                            ResponseCode.AI_SERVER_ERROR.getCode(),
                            ResponseCode.AI_SERVER_ERROR.getMessage(),
                            sessionId,
                            messageId
                    )));

            emitter.complete();

        } catch (Exception sendException) {
            log.error("SSE error 이벤트 전송 또는 실패 상태 처리 중 예외 발생. sessionId={}, messageId={}",
                    sessionId, messageId, sendException);

            emitter.completeWithError(sendException);
        }
    }

}

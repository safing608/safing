package com.safing.backend.chat.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.safing.backend.chat.client.AiChatClient;
import com.safing.backend.chat.dto.sse.ai.*;
import com.safing.backend.chat.dto.sse.frontend.CompleteEventData;
import com.safing.backend.chat.dto.sse.frontend.ErrorEventData;
import com.safing.backend.chat.dto.sse.frontend.RiskTypeEventData;
import com.safing.backend.chat.entity.ChatMessage;
import com.safing.backend.chat.entity.ChatSession;
import com.safing.backend.chat.entity.RiskType;
import com.safing.backend.chat.enumtype.ChatMessageRole;
import com.safing.backend.chat.enumtype.ChatMessageStatus;
import com.safing.backend.chat.repository.ChatMessageRepository;
import com.safing.backend.chat.repository.ChatSessionRepository;
import com.safing.backend.chat.repository.RiskTypeRepository;
import com.safing.backend.common.enumtype.CountryCode;
import com.safing.backend.common.enumtype.ResponseCode;
import com.safing.backend.common.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import com.safing.backend.chat.dto.sse.frontend.MessageEventData;

import java.io.IOException;
import java.util.List;
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
    private final AiChatClient aiChatClient;
    private final ObjectMapper objectMapper;

    public SseEmitter streamAnswer(Long userId, Long sessionId, Long messageId) {
        // 1. 세션 검증
        ChatSession session = chatSessionRepository
                .findBySessionIdAndUser_UserIdAndDeletedFalse(sessionId, userId)
                .orElseThrow(() -> new CustomException(ResponseCode.SESSION_NOT_FOUND));

        // 2. 메시지 검증
        ChatMessage message = chatMessageRepository
                .findWithParentByMessageIdAndSessionAndRole(
                        messageId,
                        session,
                        ChatMessageRole.ASSISTANT
                        )
                .orElseThrow(() -> new CustomException(ResponseCode.MESSAGE_NOT_FOUND));

        // 3. 상태 검증
        if(message.getStatus() != ChatMessageStatus.PROCESSING){
            throw new CustomException(ResponseCode.INVALID_MESSAGE_STATUS);
        }

        // 4. CountryCode 검증
        CountryCode countryCode = message.getCountryCode();

        if (countryCode == null) {
            throw new CustomException(ResponseCode.UNSUPPORTED_COUNTRY_CODE);
        }

        // 5. targetLanguage, userQuestion 꺼내기
        String targetLanguage = countryCode.getTargetLanguage();
        String userQuestion = message.getParentMessage().getContent();

        // 6. aiRequest 생성
        AiChatRequest aiChatRequest = new AiChatRequest(userQuestion, targetLanguage, sessionId);


        // 7. SseEmitter 생성 (60초 타임아웃)
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);

        ExecutorService executor = Executors.newSingleThreadExecutor();

        executor.execute(() -> {
            try {
                // ai가 보내주는 내용들 담아둘 객체
                AiStreamState state = new AiStreamState();

                for(ServerSentEvent<String> event : aiChatClient.streamChat(aiChatRequest).toIterable()){
                    boolean finished = handleAiEvent(
                            event,
                            emitter,
                            state,
                            sessionId,
                            messageId,
                            countryCode
                    );

                    // done 이벤트가 온 경우 반복 종료
                    if (finished){
                        break;
                    }
                }

                // AI 서버가 done, error 모두 없이 연결만 끊는 경우
                if (!state.completed){
                    throw new CustomException(ResponseCode.AI_SERVER_ERROR);
                }

            } catch (Exception e) {
                log.error("AI 답변 스트리밍 중 예외 발생. sessionId={}, messageId={}",
                        sessionId, messageId, e);

                handleStreamError(emitter, sessionId, messageId);

            } finally {
                executor.shutdown();
            }
        });
        return emitter;
    }

    /**
     * AI 답변 스트리밍 실패를 공통 처리한다.
     *
     * 다음과 같은 경우 이 메서드가 호출된다.
     * - AI 서버가 error 이벤트를 보낸 경우
     * - AI 서버 연결이 비정상 종료된 경우
     * - AI SSE 이벤트 파싱 또는 처리 중 예외가 발생한 경우
     * - done 이벤트 없이 스트림이 종료된 경우
     *
     * 답변 생성이 정상 완료되지 않은 상태이므로 ASSISTANT 메시지를 FAILED로 변경하고,
     * 프론트엔드에는 내부 실패 원인을 그대로 노출하지 않고 공통 AI_SERVER_ERROR 이벤트를 전송한다.
     *
     * 단, 이미 DB 저장이 완료된 뒤 complete 이벤트 전송만 실패한 경우에는
     * 이 메서드를 호출하지 않는다. 해당 경우는 done 이벤트 처리부에서 별도로 처리하여
     * COMPLETED 상태가 FAILED로 변경되지 않도록 한다.
     */
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

    /**
     * AI SSE 이벤트 처리 중 임시로 필요한 상태값을 담는 객체
     */
    private static class AiStreamState {
        private String riskTypeCode;
        private String riskTypeName;
        private String title;
        private String answer;
        private List<AiFinalAnswerEventData.Source> sources = List.of();
        private boolean completed;
    }

    /**
     * AI SSE 이벤트별 처리를 위한 메서드
     */
    private boolean handleAiEvent(
            ServerSentEvent<String> event,
            SseEmitter emitter,
            AiStreamState state,
            Long sessionId,
            Long messageId,
            CountryCode countryCode
    ) throws IOException {
        String eventName = event.event();
        String data = event.data();

        if (eventName == null || data == null) {
            return false;
        }

        switch (eventName) {
            case "risk_classification" -> {
                // riskCode 파싱
                AiRiskClassificationEventData riskData =
                        objectMapper.readValue(data, AiRiskClassificationEventData.class);

                String riskCode = riskData.riskCode();

                // RiskType 조회
                RiskType riskType = riskTypeRepository.findByRiskTypeCode(riskCode)
                        .orElseThrow(() -> new CustomException(ResponseCode.RISK_TYPE_NOT_FOUND));

                // state에 riskTypeCode, riskTypeName 채우기
                state.riskTypeCode = riskType.getRiskTypeCode();
                state.riskTypeName = riskType.getNameByCountryCode(countryCode);

                // frontend riskType 이벤트 전송
                emitter.send(SseEmitter.event()
                        .name("riskType")
                        .data(new RiskTypeEventData(
                                state.riskTypeCode,
                                state.riskTypeName
                        ))
                );

                return false;
            }

            case "safety_step" -> {
                // text 파싱
                AiSafetyStepEventData stepData =
                        objectMapper.readValue(data, AiSafetyStepEventData.class);

                // frontend message 이벤트 전송
                emitter.send(SseEmitter.event()
                        .name("message")
                        .data(new MessageEventData(stepData.text())));

                return false;
            }

            case "final_answer" -> {
                // 응답 Java 객체로 매핑
                AiFinalAnswerEventData finalData =
                        objectMapper.readValue(data, AiFinalAnswerEventData.class);

                // state에 파싱해 저장
                state.title = finalData.title();
                state.answer = finalData.answer();
                state.sources = finalData.sources() == null
                        ? List.of()
                        : finalData.sources();

                return false;
            }

            case "done" -> {
                /**
                 * frontend complete 이벤트 전송
                 *
                 *  DB 업데이트가 성공한 이후에는 답변 생성 자체는 완료된 상태이다.
                 *  이때 complete 이벤트 전송만 실패했는데 바깥 catch로 흐르게 되면
                 *  handleStreamError()에서 이미 COMPLETED로 저장된 메시지를 FAILED로 변경할 수 있다.
                 *  따라서 complete 이벤트 전송 실패는 별도로 처리하여 DB 상태를 FAILED로 바꾸지 않는다.
                 */
                AiDoneEventData doneData =
                        objectMapper.readValue(data, AiDoneEventData.class);

                // "completed" 고정값이므로 제대로 안오면 에러 처리
                if (!"completed".equals(doneData.status())) {
                    throw new CustomException(ResponseCode.AI_SERVER_ERROR);
                }

                // state에 값들 잘 들어있는지 확인
                if (state.riskTypeCode == null
                        || state.riskTypeName == null
                        || state.title == null
                        || state.title.isBlank()
                        || state.answer == null
                        || state.answer.isBlank()) {
                    throw new CustomException(ResponseCode.AI_SERVER_ERROR);
                }

                // DB 업데이트 - chat_messages, message_sources
                chatMessageCommandService.completeAssistantAnswer(
                        sessionId,
                        messageId,
                        state.title,
                        state.riskTypeCode,
                        state.answer,
                        state.sources
                );

                state.completed = true;

                try {
                    emitter.send(SseEmitter.event()
                            .name("complete")
                            .data(new CompleteEventData(
                                    state.title,
                                    state.riskTypeCode,
                                    state.riskTypeName,
                                    state.answer
                            )));

                    emitter.complete(); // 스트림 정상 종료

                } catch (IOException completeSendException) {
                    log.warn("DB 저장은 완료됐지만 complete 이벤트 전송에 실패함. sessionId={}, messageId={}",
                            sessionId, messageId, completeSendException);

                    emitter.completeWithError(completeSendException);
                }

                return true;
            }

            case "error" -> {
                AiErrorEventData errorData =
                        objectMapper.readValue(data, AiErrorEventData.class);

                log.error("AI 서버 error 이벤트 수신. aiCode={}, aiMessage={}, sessionId={}, messageId={}",
                        errorData.code(),
                        errorData.message(),
                        sessionId,
                        messageId);

                // 예외 던져서 바깥 catch에서 handleStreamError 처리
                throw new CustomException(ResponseCode.AI_SERVER_ERROR);
            }

            // 알 수 없는 이벤트의 경우 로그 남겨놓고 진행
            // done이 오면 정상 완료, done이 안오면 for문 이후 실패
            default -> {
                log.warn("알 수 없는 AI SSE 이벤트 수신. event={}, data={}", eventName, data);
                return false;
            }
        }
    }
}

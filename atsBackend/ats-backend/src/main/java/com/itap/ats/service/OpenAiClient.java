package com.itap.ats.service;

import com.itap.ats.dto.AiSuggestionsResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Component
public class OpenAiClient {

    private final WebClient client;

    public OpenAiClient(@Value("${OPENAI_API_KEY:}") String apiKey) {
        if (apiKey == null || apiKey.isBlank()) {
            // Don’t crash the app, but make it obvious later.
            this.client = null;
            return;
        }

        this.client = WebClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public AiSuggestionsResponse getSuggestions(String resumeText, String jobDescription) {
        if (client == null) {
            throw new RuntimeException("OPENAI_API_KEY is not set on the server.");
        }

        String prompt =
                "You are an ATS resume coach. Given a resume text and a job description, generate ATS-friendly improvements.\n\n"
                        + "Rules:\n"
                        + "- Do not invent experience.\n"
                        + "- Keep wording simple and natural.\n"
                        + "- Output MUST be valid JSON with keys:\n"
                        + "  improvedSummary (string),\n"
                        + "  skillsSuggestions (array of strings),\n"
                        + "  rewrittenExperienceBullets (array of strings),\n"
                        + "  projectSuggestions (array of strings),\n"
                        + "  keywordPlacementTips (array of strings),\n"
                        + "  atsWarnings (array of strings).\n\n"
                        + "Resume:\n" + resumeText + "\n\n"
                        + "Job Description:\n" + jobDescription;

        Map<String, Object> body = Map.of(
                "model", "gpt-5.2",
                "input", prompt
        );

        // Responses API returns output; we ask model to output JSON directly in text.
        Map resp = client.post()
                .uri("/responses")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        // Extract text output safely
        String text = extractFirstText(resp);
        return JsonUtil.fromJson(text, AiSuggestionsResponse.class);
    }

    private String extractFirstText(Map resp) {
        // Response shape may evolve; we defensively handle common cases.
        Object output = resp.get("output");
        if (output instanceof java.util.List<?> list && !list.isEmpty()) {
            Object item0 = list.get(0);
            if (item0 instanceof Map m0) {
                Object content = m0.get("content");
                if (content instanceof java.util.List<?> clist && !clist.isEmpty()) {
                    Object c0 = clist.get(0);
                    if (c0 instanceof Map cm) {
                        Object t = cm.get("text");
                        if (t != null) return String.valueOf(t);
                    }
                }
            }
        }
        // fallback
        Object t = resp.get("text");
        if (t != null) return String.valueOf(t);
        throw new RuntimeException("OpenAI response did not contain text output.");
    }
}

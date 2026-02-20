package com.itap.ats.service;

import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonUtil {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static <T> T fromJson(String json, Class<T> clazz) {
        try {
            return mapper.readValue(json, clazz);
        } catch (Exception e) {
            throw new RuntimeException("AI output was not valid JSON. Raw output:\n" + json, e);
        }
    }
}

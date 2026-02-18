package com.itap.ats.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public class ScanResponse {
    public UUID id;
    public int totalScore;
    public int keywordScore;
    public int sectionScore;

    public List<String> matchedKeywords;
    public List<String> missingKeywords;

    public Map<String, Boolean> sectionChecks;
    public List<String> suggestions;
}
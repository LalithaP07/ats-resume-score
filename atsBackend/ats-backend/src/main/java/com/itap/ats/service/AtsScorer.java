package com.itap.ats.service;

import com.itap.ats.util.TextUtil;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class AtsScorer {

    public static class Result {
        public int totalScore;
        public int keywordScore;
        public int sectionScore;

        public List<String> matchedKeywords;
        public List<String> missingKeywords;

        public Map<String, Boolean> sectionChecks;
        public List<String> suggestions;
    }

    public Result score(String resumeTextRaw, String jobDescriptionRaw) {
        String resumeText = TextUtil.normalize(resumeTextRaw);
        String jobDesc = jobDescriptionRaw == null ? "" : jobDescriptionRaw;

        // Keyword scoring
        List<String> keywords = TextUtil.extractKeywords(jobDesc);
        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String k : keywords) {
            String kn = TextUtil.normalize(k);
            if (kn.isBlank()) continue;
            if (TextUtil.containsWhole(resumeText, kn)) matched.add(k);
            else missing.add(k);
        }

        int keywordScore = 0;
        if (!keywords.isEmpty()) {
            double ratio = (double) matched.size() / (double) keywords.size();
            keywordScore = (int) Math.round(ratio * 100.0);
        }

        // Section checks
        Map<String, Boolean> checks = new LinkedHashMap<>();
        checks.put("Contact Info", hasContactInfo(resumeTextRaw));
        checks.put("Summary", hasAnyHeading(resumeTextRaw, "summary", "professional summary", "profile"));
        checks.put("Skills", hasAnyHeading(resumeTextRaw, "skills", "technical skills", "core skills"));
        checks.put("Experience", hasAnyHeading(resumeTextRaw, "experience", "work experience", "professional experience", "employment"));
        checks.put("Education", hasAnyHeading(resumeTextRaw, "education"));
        checks.put("Projects", hasAnyHeading(resumeTextRaw, "projects", "project experience"));
        checks.put("Certifications", hasAnyHeading(resumeTextRaw, "certifications", "certification"));

        int passed = 0;
        for (Boolean v : checks.values()) if (Boolean.TRUE.equals(v)) passed++;
        int sectionScore = (int) Math.round(((double) passed / (double) checks.size()) * 100.0);

        // Weighted total: 70% keywords + 30% sections
        int totalScore = (int) Math.round(keywordScore * 0.70 + sectionScore * 0.30);

        List<String> suggestions = buildSuggestions(totalScore, keywordScore, sectionScore, checks, missing);

        Result r = new Result();
        r.totalScore = totalScore;
        r.keywordScore = keywordScore;
        r.sectionScore = sectionScore;
        r.matchedKeywords = matched;
        r.missingKeywords = missing;
        r.sectionChecks = checks;
        r.suggestions = suggestions;
        return r;
    }

    private boolean hasAnyHeading(String raw, String... headings) {
        if (raw == null) return false;
        String lower = raw.toLowerCase(Locale.ROOT);
        for (String h : headings) {
            if (lower.contains("\n" + h) || lower.contains("\r\n" + h) || lower.contains(h + "\n") || lower.contains(h + "\r\n")) {
                return true;
            }
            if (lower.contains(h)) return true;
        }
        return false;
    }

    private boolean hasContactInfo(String raw) {
        if (raw == null) return false;
        String lower = raw.toLowerCase(Locale.ROOT);

        boolean hasEmail = lower.matches("(?s).*\\b[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}\\b.*");
        boolean hasPhone = lower.matches("(?s).*\\b(\\+?1[-.\\s]?)?(\\(?\\d{3}\\)?[-.\\s]?)\\d{3}[-.\\s]?\\d{4}\\b.*");
        return hasEmail || hasPhone;
    }

    private List<String> buildSuggestions(int total, int kw, int sec,
                                          Map<String, Boolean> checks,
                                          List<String> missingKeywords) {
        List<String> s = new ArrayList<>();

        if (total < 60) {
            s.add("Your score is low. Add the most important missing keywords into your Skills section and 1 to 2 Experience bullets.");
        } else if (total < 80) {
            s.add("Your score is decent. Add 5 to 10 missing keywords naturally across Skills and Experience to improve matching.");
        } else {
            s.add("Your score is strong. Add missing keywords only if you truly have that experience.");
        }

        if (kw < 60) {
            s.add("Keyword match is low. Mirror the job description wording in your Skills and Experience (without lying).");
        }

        if (sec < 80) {
            if (!checks.getOrDefault("Skills", true)) s.add("Add a clear Skills section with a simple list of technologies.");
            if (!checks.getOrDefault("Experience", true)) s.add("Add an Experience section with impact-focused bullets.");
            if (!checks.getOrDefault("Education", true)) s.add("Add an Education section even if it is short.");
            if (!checks.getOrDefault("Projects", true)) s.add("Add a Projects section with 1 to 3 projects including tech stack.");
            if (!checks.getOrDefault("Certifications", true)) s.add("If you have certifications, add a Certifications section. If not, skip it.");
            if (!checks.getOrDefault("Contact Info", true)) s.add("Add your email and phone at the top of the resume.");
        }

        if (!missingKeywords.isEmpty()) {
            int limit = Math.min(10, missingKeywords.size());
            s.add("Top missing keywords to consider (only if true): " + String.join(", ", missingKeywords.subList(0, limit)));
        }

        return s;
    }
}

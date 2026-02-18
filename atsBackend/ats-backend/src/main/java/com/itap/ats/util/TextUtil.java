package com.itap.ats.util;

import java.util.*;
import java.util.regex.Pattern;

public class TextUtil {

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "a","an","the","and","or","but","if","then","else","when","where","how","what",
            "with","without","to","from","in","on","at","for","of","as","is","are","was","were",
            "be","been","being","this","that","these","those","we","you","your","our","they","their",
            "will","shall","can","could","should","must","may","might","able","strong","experience",
            "years","year","plus","required","preferred","responsibilities","skills","knowledge"
    ));

    private static final Pattern NON_WORD = Pattern.compile("[^a-z0-9+.#/ ]");

    public static String normalize(String s) {
        if (s == null) return "";
        String lower = s.toLowerCase(Locale.ROOT);
        lower = NON_WORD.matcher(lower).replaceAll(" ");
        lower = lower.replaceAll("\\s+", " ").trim();
        return lower;
    }

    public static List<String> extractKeywords(String jobDesc) {
        String norm = normalize(jobDesc);

        String[] words = norm.split(" ");
        List<String> tokens = new ArrayList<>();
        for (String w : words) {
            if (w.length() < 3) continue;
            if (STOP_WORDS.contains(w)) continue;
            tokens.add(w);
        }

        List<String> phrases = new ArrayList<>();
        for (int i = 0; i < tokens.size() - 1; i++) {
            String phrase = tokens.get(i) + " " + tokens.get(i + 1);
            if (tokens.get(i).length() >= 3 && tokens.get(i + 1).length() >= 3) {
                phrases.add(phrase);
            }
        }

        LinkedHashSet<String> set = new LinkedHashSet<>();
        for (String p : phrases) set.add(p);
        for (String t : tokens) set.add(t);

        return new ArrayList<>(set);
    }

    public static boolean containsWhole(String textNorm, String keywordNorm) {
        return textNorm.contains(keywordNorm);
    }
}
package com.itap.ats.model;


import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "resume_scan")
public class ResumeScan {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    private String resumeFilename;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String jobDescription;

    @Column(nullable = false)
    private int totalScore;

    @Column(nullable = false)
    private int keywordScore;

    @Column(nullable = false)
    private int sectionScore;

    @Column(columnDefinition = "TEXT")
    private String matchedKeywordsJson;

    @Column(columnDefinition = "TEXT")
    private String missingKeywordsJson;

    @Column(columnDefinition = "TEXT")
    private String sectionChecksJson;

    @Column(columnDefinition = "TEXT")
    private String suggestionsJson;

    public UUID getId() { return id; }
    public Instant getCreatedAt() { return createdAt; }

    public String getResumeFilename() { return resumeFilename; }
    public void setResumeFilename(String resumeFilename) { this.resumeFilename = resumeFilename; }

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }

    public int getTotalScore() { return totalScore; }
    public void setTotalScore(int totalScore) { this.totalScore = totalScore; }

    public int getKeywordScore() { return keywordScore; }
    public void setKeywordScore(int keywordScore) { this.keywordScore = keywordScore; }

    public int getSectionScore() { return sectionScore; }
    public void setSectionScore(int sectionScore) { this.sectionScore = sectionScore; }

    public String getMatchedKeywordsJson() { return matchedKeywordsJson; }
    public void setMatchedKeywordsJson(String matchedKeywordsJson) { this.matchedKeywordsJson = matchedKeywordsJson; }

    public String getMissingKeywordsJson() { return missingKeywordsJson; }
    public void setMissingKeywordsJson(String missingKeywordsJson) { this.missingKeywordsJson = missingKeywordsJson; }

    public String getSectionChecksJson() { return sectionChecksJson; }
    public void setSectionChecksJson(String sectionChecksJson) { this.sectionChecksJson = sectionChecksJson; }

    public String getSuggestionsJson() { return suggestionsJson; }
    public void setSuggestionsJson(String suggestionsJson) { this.suggestionsJson = suggestionsJson; }
}

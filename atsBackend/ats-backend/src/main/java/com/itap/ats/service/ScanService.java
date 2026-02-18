package com.itap.ats.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itap.ats.dto.ScanResponse;
import com.itap.ats.model.ResumeScan;
import com.itap.ats.repo.ResumeScanRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ScanService {

    private final PdfTextExtractor pdfTextExtractor;
    private final AtsScorer atsScorer;
    private final ResumeScanRepository repo;
    private final ObjectMapper mapper = new ObjectMapper();

    public ScanService(PdfTextExtractor pdfTextExtractor, AtsScorer atsScorer, ResumeScanRepository repo) {
        this.pdfTextExtractor = pdfTextExtractor;
        this.atsScorer = atsScorer;
        this.repo = repo;
    }

    public ScanResponse scan(MultipartFile resume, String jobDescription) {
        if (resume == null || resume.isEmpty()) {
            throw new RuntimeException("Resume file is required.");
        }
        if (jobDescription == null || jobDescription.trim().isEmpty()) {
            throw new RuntimeException("Job description is required.");
        }
        if (resume.getOriginalFilename() == null || !resume.getOriginalFilename().toLowerCase().endsWith(".pdf")) {
            throw new RuntimeException("Please upload a PDF resume only.");
        }

        String resumeText;
        try {
            resumeText = pdfTextExtractor.extractText(resume.getInputStream());
        } catch (Exception e) {
            throw new RuntimeException("Could not read the PDF file.", e);
        }

        AtsScorer.Result result = atsScorer.score(resumeText, jobDescription);

        ResumeScan scan = new ResumeScan();
        scan.setResumeFilename(resume.getOriginalFilename());
        scan.setJobDescription(jobDescription);
        scan.setTotalScore(result.totalScore);
        scan.setKeywordScore(result.keywordScore);
        scan.setSectionScore(result.sectionScore);

        try {
            scan.setMatchedKeywordsJson(mapper.writeValueAsString(result.matchedKeywords));
            scan.setMissingKeywordsJson(mapper.writeValueAsString(result.missingKeywords));
            scan.setSectionChecksJson(mapper.writeValueAsString(result.sectionChecks));
            scan.setSuggestionsJson(mapper.writeValueAsString(result.suggestions));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize scan result.", e);
        }

        ResumeScan saved = repo.save(scan);

        ScanResponse resp = new ScanResponse();
        resp.id = saved.getId();
        resp.totalScore = result.totalScore;
        resp.keywordScore = result.keywordScore;
        resp.sectionScore = result.sectionScore;
        resp.matchedKeywords = result.matchedKeywords;
        resp.missingKeywords = result.missingKeywords;
        resp.sectionChecks = result.sectionChecks;
        resp.suggestions = result.suggestions;

        return resp;
    }

    public ResumeScan getById(java.util.UUID id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Scan not found"));
    }
}

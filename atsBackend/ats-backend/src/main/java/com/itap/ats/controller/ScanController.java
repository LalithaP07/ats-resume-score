package com.itap.ats.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itap.ats.dto.ScanResponse;
import com.itap.ats.model.ResumeScan;
import com.itap.ats.repo.ResumeScanRepository;
import com.itap.ats.service.ScanService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api")
public class ScanController {

    private final ScanService scanService;
    private final ResumeScanRepository repo;
    private final ObjectMapper mapper = new ObjectMapper();

    public ScanController(ScanService scanService, ResumeScanRepository repo) {
        this.scanService = scanService;
        this.repo = repo;
    }

    @PostMapping("/scan")
    public ScanResponse scan(@RequestParam("resume") MultipartFile resume,
                             @RequestParam("jobDescription") String jobDescription) {
        return scanService.scan(resume, jobDescription);
    }

    @GetMapping("/scans")
    public List<Map<String, Object>> listScans() {
        List<ResumeScan> scans = repo.findAll();
        scans.sort(Comparator.comparing(ResumeScan::getCreatedAt).reversed());

        List<Map<String, Object>> out = new ArrayList<>();
        for (ResumeScan s : scans) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", s.getId());
            row.put("createdAt", s.getCreatedAt());
            row.put("resumeFilename", s.getResumeFilename());
            row.put("totalScore", s.getTotalScore());
            row.put("keywordScore", s.getKeywordScore());
            row.put("sectionScore", s.getSectionScore());
            out.add(row);
        }
        return out;
    }

    @GetMapping("/scan/{id}")
    public ScanResponse getScan(@PathVariable("id") UUID id) {
        ResumeScan s = scanService.getById(id);

        ScanResponse resp = new ScanResponse();
        resp.id = s.getId();
        resp.totalScore = s.getTotalScore();
        resp.keywordScore = s.getKeywordScore();
        resp.sectionScore = s.getSectionScore();

        try {
            resp.matchedKeywords = Arrays.asList(mapper.readValue(s.getMatchedKeywordsJson(), String[].class));
            resp.missingKeywords = Arrays.asList(mapper.readValue(s.getMissingKeywordsJson(), String[].class));
            resp.sectionChecks = mapper.readValue(s.getSectionChecksJson(), Map.class);
            resp.suggestions = Arrays.asList(mapper.readValue(s.getSuggestionsJson(), String[].class));
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse saved scan result.", e);
        }

        return resp;
    }
}

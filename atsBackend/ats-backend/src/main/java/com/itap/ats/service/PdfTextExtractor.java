package com.itap.ats.service;


import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.InputStream;

@Component
public class PdfTextExtractor {

    public String extractText(InputStream inputStream) {
        try (PDDocument doc = PDDocument.load(inputStream)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(doc);
            return text == null ? "" : text;
        } catch (Exception e) {
            throw new RuntimeException("Failed to read PDF. Please upload a valid PDF resume.", e);
        }
    }
}

package com.itap.ats.repo;


import com.itap.ats.model.ResumeScan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ResumeScanRepository extends JpaRepository<ResumeScan, UUID> {}

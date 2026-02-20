const API_BASE = "https://ats-resume-score-js1h.onrender.com";

export async function runScan(resumeFile, jobDescription) {
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jobDescription", jobDescription);

    const res = await fetch(`${API_BASE}/api/scan`, {
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Scan failed");
    }

    return res.json();
}

export async function getScans() {
    const res = await fetch(`${API_BASE}/api/scans`);
    if (!res.ok) throw new Error("Failed to load history");
    return res.json();
}

export async function getScanById(id) {
    const res = await fetch(`${API_BASE}/api/scan/${id}`);
    if (!res.ok) throw new Error("Failed to load scan");
    return res.json();
}
export async function getAiSuggestions(resumeFile, jobDescription) {
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jobDescription", jobDescription);

    const res = await fetch(`${API_BASE}/api/ai-suggestions`, {
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "AI suggestions failed");
    }

    return res.json();
}
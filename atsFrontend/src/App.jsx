import { useEffect, useState } from "react";
import { runScan, getScans, getScanById } from "./api";

export default function App() {
    const [resumeFile, setResumeFile] = useState(null);
    const [jobDescription, setJobDescription] = useState("");
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadHistory() {
        const data = await getScans();
        setHistory(data);
    }

    useEffect(() => {
        loadHistory().catch(() => {});
    }, []);

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        setResult(null);

        if (!resumeFile) {
            setError("Please upload your resume PDF.");
            return;
        }
        if (!jobDescription.trim()) {
            setError("Please paste the job description.");
            return;
        }

        try {
            setLoading(true);
            const data = await runScan(resumeFile, jobDescription);
            setResult(data);
            await loadHistory();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function openHistory(id) {
        try {
            const data = await getScanById(id);
            setResult(data);
            setError("");
        } catch {
            setError("Failed to open scan.");
        }
    }

    return (
        <div style={{ fontFamily: "Arial", maxWidth: 980, margin: "30px auto", padding: 16 }}>
            <h1>Free ATS Resume Score</h1>
            <p>Upload a PDF resume + paste a job description. Get keyword match + section checks.</p>

            <form onSubmit={onSubmit} style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
                <div style={{ marginBottom: 12 }}>
                    <label><b>Resume (PDF)</b></label><br />
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    />
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label><b>Job Description</b></label><br />
                    <textarea
                        rows={10}
                        style={{ width: "100%" }}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description here..."
                    />
                </div>

                {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? "Scoring..." : "Get ATS Score"}
                </button>
            </form>

            {result && (
                <div style={{ marginTop: 20, border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
                    <h2>Score</h2>
                    <h3>Total: {result.totalScore}/100</h3>
                    <p>Keyword Score: {result.keywordScore}/100</p>
                    <p>Section Score: {result.sectionScore}/100</p>

                    <h3>Section Checks</h3>
                    <ul>
                        {Object.entries(result.sectionChecks || {}).map(([k, v]) => (
                            <li key={k}>{k}: <b>{v ? "Present" : "Missing"}</b></li>
                        ))}
                    </ul>

                    <h3>Matched Keywords</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {(result.matchedKeywords || []).slice(0, 60).map((k) => (
                            <span key={k} style={{ border: "1px solid #bbb", padding: "4px 8px", borderRadius: 999 }}>
                {k}
              </span>
                        ))}
                    </div>

                    <h3 style={{ marginTop: 14 }}>Missing Keywords</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {(result.missingKeywords || []).slice(0, 60).map((k) => (
                            <span key={k} style={{ border: "1px solid #bbb", padding: "4px 8px", borderRadius: 999 }}>
                {k}
              </span>
                        ))}
                    </div>

                    <h3 style={{ marginTop: 14 }}>Suggestions</h3>
                    <ul>
                        {(result.suggestions || []).map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                </div>
            )}

            <div style={{ marginTop: 20 }}>
                <h2>History</h2>
                {history.length === 0 ? (
                    <p>No scans yet.</p>
                ) : (
                    <ul>
                        {history.slice(0, 15).map((h) => (
                            <li key={h.id}>
                                <button onClick={() => openHistory(h.id)} style={{ marginRight: 8 }}>Open</button>
                                <b>{h.totalScore}</b>/100 — {h.resumeFilename} — {new Date(h.createdAt).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

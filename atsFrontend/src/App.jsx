import { useEffect, useMemo, useState } from "react";
import { runScan, getScans, getScanById } from "./api";
import { getAiSuggestions } from "./api";


function ScorePill({ score }) {
    const label =
        score >= 80 ? "Strong" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Low";

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.06)",
                fontSize: 13,
                color: "rgba(255,255,255,0.9)"
            }}
        >
      <span
          style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background:
                  score >= 80
                      ? "#34d399"
                      : score >= 60
                          ? "#60a5fa"
                          : score >= 40
                              ? "#fbbf24"
                              : "#fb7185"
          }}
      />
            {label} • {score}/100
    </span>
    );
}

function ProgressBar({ value }) {
    const v = Math.max(0, Math.min(100, Number(value || 0)));
    return (
        <div
            style={{
                width: "100%",
                height: 10,
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.10)"
            }}
        >
            <div
                style={{
                    width: `${v}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: "linear-gradient(90deg, #60a5fa, #34d399)"
                }}
            />
        </div>
    );
}

function Chip({ children }) {
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.06)",
                fontSize: 12,
                color: "rgba(255,255,255,0.92)"
            }}
        >
      {children}
    </span>
    );
}

function Card({ title, right, children }) {
    return (
        <div
            style={{
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 16,
                background: "rgba(17, 24, 39, 0.65)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                backdropFilter: "blur(10px)"
            }}
        >
            <div
                style={{
                    padding: 16,
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12
                }}
            >
                <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>
                    {title}
                </div>
                {right}
            </div>
            <div style={{ padding: 16 }}>{children}</div>
        </div>
    );
}

export default function App() {
    const [resumeFile, setResumeFile] = useState(null);
    const [jobDescription, setJobDescription] = useState("");
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");
    const [aiResult, setAiResult] = useState(null);


    async function loadHistory() {
        const data = await getScans();
        setHistory(data);
    }

    useEffect(() => {
        loadHistory().catch(() => {});
    }, []);

    const sectionChecks = useMemo(() => result?.sectionChecks || {}, [result]);

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        setResult(null);

        if (!resumeFile) return setError("Please upload a PDF resume.");
        if (!jobDescription.trim()) return setError("Please paste a job description.");

        try {
            setLoading(true);
            const data = await runScan(resumeFile, jobDescription);
            setResult(data);
            await loadHistory();
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    async function openHistory(id) {
        try {
            const data = await getScanById(id);
            setResult(data);
            setError("");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
            setError("Failed to open scan.");
        }
    }

    async function onAiSuggestions() {
        setAiError("");
        setAiResult(null);

        if (!resumeFile) return setAiError("Upload a PDF first to generate AI suggestions.");
        if (!jobDescription.trim()) return setAiError("Paste a job description first.");

        try {
            setAiLoading(true);
            const data = await getAiSuggestions(resumeFile, jobDescription);
            setAiResult(data);
        } catch (err) {
            setAiError(err.message || "AI suggestions failed");
        } finally {
            setAiLoading(false);
        }
    }


    return (
        <div
            style={{
                minHeight: "100vh",
                background:
                    "radial-gradient(1200px 700px at 10% 10%, rgba(96,165,250,0.25), transparent 60%), radial-gradient(900px 600px at 90% 20%, rgba(52,211,153,0.18), transparent 55%), radial-gradient(1000px 600px at 50% 100%, rgba(251,113,133,0.12), transparent 60%), #0b1220",
                color: "white"
            }}
        >
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 16px 60px" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}>
                            ATS Resume Score
                        </div>
                        <div style={{ marginTop: 8, color: "rgba(255,255,255,0.70)", lineHeight: 1.5 }}>
                            Upload a PDF resume and paste a job description. Get keyword match + section checks + suggestions.
                        </div>
                    </div>

                    {result?.totalScore != null && <ScorePill score={result.totalScore} />}
                </div>

                {/* Main grid */}
                <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 16 }}>
                    {/* Left: Form */}
                    <Card
                        title="Run a Scan"
                        right={
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                Backend: Render • DB: Postgres
              </span>
                        }
                    >
                        <form onSubmit={onSubmit}>
                            <div style={{ display: "grid", gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "rgba(255,255,255,0.88)" }}>
                                        Resume (PDF)
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 12,
                                            padding: 12,
                                            borderRadius: 14,
                                            border: "1px dashed rgba(255,255,255,0.20)",
                                            background: "rgba(255,255,255,0.04)"
                                        }}
                                    >
                                        <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {resumeFile ? resumeFile.name : "Choose a PDF file to upload"}
                                        </div>
                                        <label
                                            style={{
                                                cursor: "pointer",
                                                padding: "8px 12px",
                                                borderRadius: 12,
                                                background: "rgba(255,255,255,0.10)",
                                                border: "1px solid rgba(255,255,255,0.14)",
                                                fontSize: 13,
                                                fontWeight: 700
                                            }}
                                        >
                                            Browse
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                style={{ display: "none" }}
                                                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "rgba(255,255,255,0.88)" }}>
                                        Job Description
                                    </div>
                                    <textarea
                                        rows={10}
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the job description here..."
                                        style={{
                                            width: "100%",
                                            resize: "vertical",
                                            padding: 12,
                                            borderRadius: 14,
                                            border: "1px solid rgba(255,255,255,0.12)",
                                            background: "rgba(255,255,255,0.04)",
                                            color: "rgba(255,255,255,0.92)",
                                            outline: "none",
                                            lineHeight: 1.5
                                        }}
                                    />
                                </div>

                                {error && (
                                    <div
                                        style={{
                                            padding: 12,
                                            borderRadius: 14,
                                            border: "1px solid rgba(251,113,133,0.35)",
                                            background: "rgba(251,113,133,0.10)",
                                            color: "rgba(255,255,255,0.92)",
                                            fontSize: 13
                                        }}
                                    >
                                        {error}
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            cursor: loading ? "not-allowed" : "pointer",
                                            padding: "10px 14px",
                                            borderRadius: 14,
                                            border: "1px solid rgba(255,255,255,0.14)",
                                            background: loading
                                                ? "rgba(255,255,255,0.10)"
                                                : "linear-gradient(90deg, rgba(96,165,250,0.85), rgba(52,211,153,0.75))",
                                            color: "rgba(10,15,25,0.95)",
                                            fontWeight: 800,
                                            fontSize: 14
                                        }}
                                    >
                                        {loading ? "Scoring..." : "Get ATS Score"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={onAiSuggestions}
                                        disabled={aiLoading}
                                        style={{
                                            cursor: aiLoading ? "not-allowed" : "pointer",
                                            padding: "10px 14px",
                                            borderRadius: 14,
                                            border: "1px solid rgba(255,255,255,0.14)",
                                            background: aiLoading
                                                ? "rgba(255,255,255,0.10)"
                                                : "linear-gradient(90deg, rgba(167,139,250,0.85), rgba(96,165,250,0.75))",
                                            color: "rgba(10,15,25,0.95)",
                                            fontWeight: 800,
                                            fontSize: 14
                                        }}
                                    >
                                        {aiLoading ? "Generating..." : "Generate AI Suggestions"}
                                    </button>


                                    <button
                                        type="button"
                                        onClick={() => {
                                            setResumeFile(null);
                                            setJobDescription("");
                                            setResult(null);
                                            setError("");
                                        }}
                                        style={{
                                            cursor: "pointer",
                                            padding: "10px 14px",
                                            borderRadius: 14,
                                            border: "1px solid rgba(255,255,255,0.14)",
                                            background: "rgba(255,255,255,0.06)",
                                            color: "rgba(255,255,255,0.85)",
                                            fontWeight: 700,
                                            fontSize: 14
                                        }}


                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </form>
                    </Card>

                    {/* Right: Score summary */}
                    <Card
                        title="Score Summary"
                        right={
                            result?.totalScore != null ? (
                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.70)" }}>
                  Updated just now
                </span>
                            ) : (
                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                  Run a scan to see results
                </span>
                            )
                        }
                    >
                        {result?.totalScore == null ? (
                            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.6 }}>
                                Upload a resume and job description on the left. You will get:
                                <ul style={{ marginTop: 10, paddingLeft: 18 }}>
                                    <li>Overall ATS score</li>
                                    <li>Keyword match vs missing keywords</li>
                                    <li>Section checks (Skills, Experience, etc.)</li>
                                    <li>Suggestions to improve</li>
                                </ul>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gap: 14 }}>
                                <div style={{ display: "grid", gap: 8 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                        <div style={{ fontWeight: 800, fontSize: 14, color: "rgba(255,255,255,0.92)" }}>
                                            Total Score
                                        </div>
                                        <div style={{ fontWeight: 800, fontSize: 14 }}>{result.totalScore}/100</div>
                                    </div>
                                    <ProgressBar value={result.totalScore} />
                                </div>

                                <div style={{ display: "grid", gap: 10 }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                        <div style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)" }}>
                                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", fontWeight: 700 }}>Keyword Score</div>
                                            <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900 }}>{result.keywordScore}/100</div>
                                        </div>
                                        <div style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)" }}>
                                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", fontWeight: 700 }}>Section Score</div>
                                            <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900 }}>{result.sectionScore}/100</div>
                                        </div>
                                    </div>

                                    <div style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)" }}>
                                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", fontWeight: 700 }}>Section Checks</div>
                                        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                                            {Object.entries(sectionChecks).map(([k, v]) => (
                                                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                                    <div style={{ color: "rgba(255,255,255,0.82)", fontSize: 13 }}>{k}</div>
                                                    <div
                                                        style={{
                                                            fontSize: 12,
                                                            fontWeight: 800,
                                                            color: v ? "#34d399" : "#fb7185"
                                                        }}
                                                    >
                                                        {v ? "Present" : "Missing"}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Results */}
                {result?.totalScore != null && (
                    <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <Card title={`Matched Keywords (${(result.matchedKeywords || []).length})`}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {(result.matchedKeywords || []).slice(0, 80).map((k) => (
                                    <Chip key={k}>{k}</Chip>
                                ))}
                            </div>
                            {(result.matchedKeywords || []).length > 80 && (
                                <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.60)" }}>
                                    Showing first 80 matched keywords.
                                </div>
                            )}
                        </Card>

                        <Card title={`Missing Keywords (${(result.missingKeywords || []).length})`}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {(result.missingKeywords || []).slice(0, 80).map((k) => (
                                    <Chip key={k}>{k}</Chip>
                                ))}
                            </div>
                            {(result.missingKeywords || []).length > 80 && (
                                <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.60)" }}>
                                    Showing first 80 missing keywords.
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                {result?.suggestions?.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                        <Card title="Suggestions">
                            <ul style={{ margin: 0, paddingLeft: 18, color: "rgba(255,255,255,0.82)", lineHeight: 1.7 }}>
                                {result.suggestions.map((s, idx) => (
                                    <li key={idx}>{s}</li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                )}

                {(aiError || aiResult) && (
                    <div style={{ marginTop: 16 }}>
                        <Card
                            title="AI Suggestions"
                            right={
                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.60)" }}>
          Uses resume + JD. No data saved.
        </span>
                            }
                        >
                            {aiError && (
                                <div
                                    style={{
                                        padding: 12,
                                        borderRadius: 14,
                                        border: "1px solid rgba(251,113,133,0.35)",
                                        background: "rgba(251,113,133,0.10)",
                                        color: "rgba(255,255,255,0.92)",
                                        fontSize: 13
                                    }}
                                >
                                    {aiError}
                                </div>
                            )}

                            {aiResult && (
                                <div style={{ display: "grid", gap: 14 }}>
                                    {aiResult.improvedSummary && (
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.70)" }}>Improved Summary</div>
                                            <div style={{ marginTop: 6, color: "rgba(255,255,255,0.90)", lineHeight: 1.6 }}>
                                                {aiResult.improvedSummary}
                                            </div>
                                        </div>
                                    )}

                                    {Array.isArray(aiResult.skillsSuggestions) && aiResult.skillsSuggestions.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.70)" }}>Skills Suggestions</div>
                                            <ul style={{ marginTop: 8, paddingLeft: 18, color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>
                                                {aiResult.skillsSuggestions.map((x, i) => <li key={i}>{x}</li>)}
                                            </ul>
                                        </div>
                                    )}

                                    {Array.isArray(aiResult.rewrittenExperienceBullets) && aiResult.rewrittenExperienceBullets.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.70)" }}>Rewritten Experience Bullets</div>
                                            <ul style={{ marginTop: 8, paddingLeft: 18, color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>
                                                {aiResult.rewrittenExperienceBullets.map((x, i) => <li key={i}>{x}</li>)}
                                            </ul>
                                        </div>
                                    )}

                                    {Array.isArray(aiResult.projectSuggestions) && aiResult.projectSuggestions.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.70)" }}>Project Suggestions</div>
                                            <ul style={{ marginTop: 8, paddingLeft: 18, color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>
                                                {aiResult.projectSuggestions.map((x, i) => <li key={i}>{x}</li>)}
                                            </ul>
                                        </div>
                                    )}

                                    {Array.isArray(aiResult.keywordPlacementTips) && aiResult.keywordPlacementTips.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.70)" }}>Keyword Placement Tips</div>
                                            <ul style={{ marginTop: 8, paddingLeft: 18, color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>
                                                {aiResult.keywordPlacementTips.map((x, i) => <li key={i}>{x}</li>)}
                                            </ul>
                                        </div>
                                    )}

                                    {Array.isArray(aiResult.atsWarnings) && aiResult.atsWarnings.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.70)" }}>ATS Warnings</div>
                                            <ul style={{ marginTop: 8, paddingLeft: 18, color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>
                                                {aiResult.atsWarnings.map((x, i) => <li key={i}>{x}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    </div>
                )}


                {/* History */}
                <div style={{ marginTop: 16 }}>
                    <Card
                        title="History"
                        right={<span style={{ fontSize: 12, color: "rgba(255,255,255,0.60)" }}>Latest 15</span>}
                    >
                        {history.length === 0 ? (
                            <div style={{ color: "rgba(255,255,255,0.65)" }}>No scans yet.</div>
                        ) : (
                            <div style={{ display: "grid", gap: 10 }}>
                                {history.slice(0, 15).map((h) => (
                                    <div
                                        key={h.id}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "120px 1fr",
                                            gap: 12,
                                            padding: 12,
                                            borderRadius: 14,
                                            border: "1px solid rgba(255,255,255,0.10)",
                                            background: "rgba(255,255,255,0.04)"
                                        }}
                                    >
                                        <button
                                            onClick={() => openHistory(h.id)}
                                            style={{
                                                cursor: "pointer",
                                                padding: "10px 12px",
                                                borderRadius: 14,
                                                border: "1px solid rgba(255,255,255,0.14)",
                                                background: "rgba(255,255,255,0.08)",
                                                color: "rgba(255,255,255,0.88)",
                                                fontWeight: 800
                                            }}
                                        >
                                            Open
                                        </button>

                                        <div style={{ overflow: "hidden" }}>
                                            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                                                <ScorePill score={h.totalScore} />
                                                <div style={{ color: "rgba(255,255,255,0.88)", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {h.resumeFilename}
                                                </div>
                                            </div>

                                            <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.60)" }}>
                                                {new Date(h.createdAt).toLocaleString()}
                                                {" • "}Keyword {h.keywordScore}/100 • Section {h.sectionScore}/100
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                <div style={{ marginTop: 18, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                    Tip: For best results, paste the full job description and keep your resume sections clearly labeled
                    (Skills, Experience, Education, Projects).
                </div>
            </div>

            <style>{`
        @media (max-width: 980px) {
          .grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  Brain,
  FileText,
  Loader2,
  Sparkles,
  UploadCloud,
  Upload,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useDropzone } from "react-dropzone";

type ResumeCard = {
  id: string;
  fileName: string;
  version: string;
  createdAt: string;
};

function ResumeDropzone({ file, onSelect, disabled }: { file: File | null; onSelect: (f: File | null) => void; disabled: boolean }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) onSelect(acceptedFiles[0]);
    },
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer ${
        isDragActive
          ? "border-cyan-500 bg-cyan-500/10"
          : file
            ? "border-emerald-500/50 bg-emerald-500/5"
            : "border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />

      <div className="text-center">
        {file ? (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-zinc-500 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(null);
              }}
              className="text-zinc-400 text-sm hover:text-white transition-colors"
            >
              Remove and upload different file
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto rounded-xl bg-white/10 flex items-center justify-center">
              <UploadCloud size={28} className={isDragActive ? "text-cyan-400" : "text-zinc-400"} />
            </div>
            <div>
              <p className="text-white font-medium">
                {isDragActive ? "Drop your resume here" : "Upload Your Resume"}
              </p>
              <p className="text-zinc-500 text-sm">PDF or DOCX • Max 10MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WorkspacePage() {
  const router = useRouter();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [savedResumes, setSavedResumes] = useState<ResumeCard[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState("Preparing request...");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/resume/list");
        if (!res.ok) {
          setSavedResumes([]);
          return;
        }
        const data = (await res.json()) as { resumes?: ResumeCard[] };
        setSavedResumes(data.resumes ?? []);
      } finally {
        setIsLoadingResumes(false);
      }
    })();
  }, []);

  const handleAnalyze = async () => {
    if (!resumeFile && !selectedResumeId) {
      setError("Upload a resume or select a saved resume.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste the job description.");
      return;
    }

    setError("");
    setIsProcessing(true);

    try {
      setProgress(15);
      setProcessingStep("Uploading resume and parsing...");
      const fd = new FormData();
      fd.append("jobDescription", jobDescription);
      const localUserId = localStorage.getItem("talentos_user_id");
      if (localUserId) fd.append("userId", localUserId);
      if (selectedResumeId) {
        fd.append("resumeId", selectedResumeId);
      } else if (resumeFile) {
        fd.append("resume", resumeFile);
      }

      const response = await fetch("/api/talentos/analyze", {
        method: "POST",
        body: fd,
      });
      setProgress(80);
      setProcessingStep("Generating dynamic match analysis...");

      const result = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !result.id) {
        throw new Error(result.error ?? "Analysis failed");
      }
      setProgress(100);
      setProcessingStep("Done. Redirecting...");
      router.push(`/analysis?id=${result.id}`);
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
      setProgress(0);
    }
  };

  const canSubmit = useMemo(
    () => Boolean((resumeFile || selectedResumeId) && jobDescription.trim()),
    [resumeFile, selectedResumeId, jobDescription]
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[length:4rem_4rem] pointer-events-none" />

      <nav className="relative z-50 border-b border-white/5 backdrop-blur-xl bg-black/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-bold font-[family-name:var(--font-space)] text-white">TalentOS</span>
              <span className="text-xs text-zinc-500 block">by AdsGupta</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-zinc-500 text-sm hidden md:block">Free Analysis</span>
            <div className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium">
              No Credit Card
            </div>
          </div>
        </div>
      </nav>

      <main className="relative pt-12 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Sparkles size={14} className="text-cyan-400" />
              <span className="text-zinc-400 text-sm">AI-Powered Analysis</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-space)] mb-4">
              Let&apos;s Analyze Your Fit
            </h1>
            <p className="text-zinc-400 text-lg">
              Upload your resume (or reuse a saved one) and paste the job description.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8"
          >
            <div className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold">
                  1
                </div>
                <h2 className="text-lg font-semibold text-white">Upload Your Resume</h2>
              </div>
              <ResumeDropzone file={resumeFile} onSelect={(f) => {
                setResumeFile(f);
                if (f) setSelectedResumeId("");
              }} disabled={isProcessing} />
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">
                  2
                </div>
                <h2 className="text-lg font-semibold text-white">Saved Resumes</h2>
              </div>
              {isLoadingResumes ? (
                <p className="text-zinc-500 text-sm">Loading saved resumes...</p>
              ) : savedResumes.length === 0 ? (
                <p className="text-zinc-500 text-sm">No saved resumes yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savedResumes.map((resume) => (
                    <button
                      key={resume.id}
                      type="button"
                      onClick={() => {
                        setSelectedResumeId(resume.id);
                        setResumeFile(null);
                      }}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        selectedResumeId === resume.id
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <p className="text-white font-medium">{resume.fileName}</p>
                      <p className="text-zinc-500 text-xs mt-1">{resume.version} • {new Date(resume.createdAt).toLocaleDateString()}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold">
                  3
                </div>
                <h2 className="text-lg font-semibold text-white">Add Job Description</h2>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                disabled={isProcessing}
                className="w-full h-56 p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-cyan-500/50 transition-all disabled:opacity-50"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400"
                >
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              onClick={handleAnalyze}
              disabled={!canSubmit || isProcessing}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                canSubmit && !isProcessing
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                  : "bg-white/10 text-zinc-500 cursor-not-allowed"
              }`}
              data-testid="analyze-btn"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {processingStep}
                </>
              ) : (
                <>
                  <Brain size={20} />
                  Analyze Match
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>
            {isProcessing && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">Analysis Progress</span>
                  <span className="text-cyan-400">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

"use client";

/**
 * TalentOS Workspace — port of TalentOSWorkspace.jsx
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Link as LinkIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Bot,
  Sparkles,
  Brain,
  Target,
  Briefcase,
  Zap,
} from "lucide-react";

function ResumeDropzone({
  onFileUpload,
  uploadedFile,
  isProcessing,
}: {
  onFileUpload: (f: File | null) => void;
  uploadedFile: File | null;
  isProcessing: boolean;
}) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) onFileUpload(acceptedFiles[0]);
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer ${
        isDragActive
          ? "border-cyan-500 bg-cyan-500/10"
          : uploadedFile
            ? "border-emerald-500/50 bg-emerald-500/5"
            : "border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10"
      } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
      data-testid="resume-dropzone"
    >
      <input {...getInputProps()} />

      <div className="text-center">
        {uploadedFile ? (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-medium">{uploadedFile.name}</p>
              <p className="text-zinc-500 text-sm">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileUpload(null);
              }}
              className="text-zinc-400 text-sm hover:text-white transition-colors"
            >
              Remove and upload different file
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto rounded-xl bg-white/10 flex items-center justify-center">
              <Upload size={28} className={isDragActive ? "text-cyan-400" : "text-zinc-400"} />
            </div>
            <div>
              <p className="text-white font-medium">
                {isDragActive ? "Drop your resume here" : "Upload Your Resume"}
              </p>
              <p className="text-zinc-500 text-sm">PDF, DOC, DOCX or TXT • Max 5MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function JDInput({
  jdText,
  setJdText,
  jdUrl,
  setJdUrl,
  inputMode,
  setInputMode,
  isProcessing,
}: {
  jdText: string;
  setJdText: (s: string) => void;
  jdUrl: string;
  setJdUrl: (s: string) => void;
  inputMode: "paste" | "url";
  setInputMode: (m: "paste" | "url") => void;
  isProcessing: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setInputMode("paste")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            inputMode === "paste"
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
              : "bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10"
          }`}
        >
          <FileText size={16} />
          Paste JD Text
        </button>
        <button
          type="button"
          onClick={() => setInputMode("url")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            inputMode === "url"
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
              : "bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10"
          }`}
        >
          <LinkIcon size={16} />
          LinkedIn URL
        </button>
      </div>

      {inputMode === "paste" ? (
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder={`Paste the job description here...\n\nExample:\nWe're looking for a Senior Programmatic Specialist...`}
          disabled={isProcessing}
          className="w-full h-48 p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-cyan-500/50 transition-all disabled:opacity-50"
          data-testid="jd-text-input"
        />
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="url"
              value={jdUrl}
              onChange={(e) => setJdUrl(e.target.value)}
              placeholder="https://linkedin.com/jobs/view/..."
              disabled={isProcessing}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-all disabled:opacity-50"
              data-testid="jd-url-input"
            />
          </div>
          <p className="text-zinc-500 text-xs">
            We&apos;ll extract the job description from the LinkedIn posting
          </p>
        </div>
      )}
    </div>
  );
}

function LinkedInProfileInput({
  profileUrl,
  setProfileUrl,
  isProcessing,
}: {
  profileUrl: string;
  setProfileUrl: (s: string) => void;
  isProcessing: boolean;
}) {
  return (
    <div className="space-y-3">
      <label className="text-zinc-400 text-sm">LinkedIn Profile (Optional)</label>
      <div className="relative">
        <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="url"
          value={profileUrl}
          onChange={(e) => setProfileUrl(e.target.value)}
          placeholder="https://linkedin.com/in/your-profile"
          disabled={isProcessing}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-all disabled:opacity-50"
          data-testid="linkedin-profile-input"
        />
      </div>
      <p className="text-zinc-500 text-xs">We&apos;ll use your public profile data to enhance the analysis</p>
    </div>
  );
}

export default function WorkspacePage() {
  const router = useRouter();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [jdInputMode, setJdInputMode] = useState<"paste" | "url">("paste");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [error, setError] = useState("");

  const handleResumeUpload = async (file: File | null) => {
    if (!file) {
      setResumeFile(null);
      setResumeText("");
      return;
    }
    setResumeFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (file.type === "text/plain" && typeof text === "string") {
        setResumeText(text);
      } else {
        setResumeText(`[File: ${file.name}] - Will be parsed by AI`);
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!resumeFile) {
      setError("Please upload your resume");
      return;
    }
    const hasJD = jdInputMode === "paste" ? jdText.trim() : jdUrl.trim();
    if (!hasJD) {
      setError("Please provide a job description");
      return;
    }

    setError("");
    setIsProcessing(true);

    try {
      setProcessingStep("Parsing your resume...");
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStep("Extracting job requirements...");
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStep("Running AI gap analysis...");

      const response = await fetch("/api/talentos/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resumeText || `Resume from file: ${resumeFile.name}`,
          jd_text: jdInputMode === "paste" ? jdText : `JD from URL: ${jdUrl}`,
          linkedin_url: linkedInUrl || null,
        }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const result = await response.json();
      sessionStorage.setItem("talentos_analysis", JSON.stringify(result));
      router.push("/analysis");
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Analysis failed. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const canSubmit = Boolean(resumeFile && (jdInputMode === "paste" ? jdText.trim() : jdUrl.trim()));

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
              Upload your resume and provide a job description for instant AI analysis
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
              <ResumeDropzone
                onFileUpload={handleResumeUpload}
                uploadedFile={resumeFile}
                isProcessing={isProcessing}
              />
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold">
                  2
                </div>
                <h2 className="text-lg font-semibold text-white">Add Job Description</h2>
              </div>
              <JDInput
                jdText={jdText}
                setJdText={setJdText}
                jdUrl={jdUrl}
                setJdUrl={setJdUrl}
                inputMode={jdInputMode}
                setInputMode={setJdInputMode}
                isProcessing={isProcessing}
              />
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">
                  3
                </div>
                <h2 className="text-lg font-semibold text-white">LinkedIn Profile</h2>
                <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-zinc-400">Optional</span>
              </div>
              <LinkedInProfileInput
                profileUrl={linkedInUrl}
                setProfileUrl={setLinkedInUrl}
                isProcessing={isProcessing}
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
                  Run AI Gap Analysis
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Brain, label: "Gap Analysis", desc: "Skill gaps identified" },
                { icon: Target, label: "Match Score", desc: "% fit calculated" },
                { icon: Briefcase, label: "Interview Qs", desc: "Custom questions" },
                { icon: Zap, label: "Action Plan", desc: "Improvement roadmap" },
              ].map((item, index) => (
                <div key={index} className="text-center p-4 rounded-xl bg-white/5 border border-white/5">
                  <item.icon size={20} className="mx-auto text-zinc-400 mb-2" />
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-zinc-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

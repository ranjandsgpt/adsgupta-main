"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Crown,
  Loader2,
  Mic,
  MicOff,
  Send,
  Star,
  User,
} from "lucide-react";
import { PERSONAS, type PersonaKey } from "@/lib/interview-personas";

type Message = {
  role: "interviewer" | "candidate" | "system";
  content: string;
  timestamp: string;
  category?: string;
  difficulty?: number;
  evaluation?: {
    situation: number;
    task: number;
    action: number;
    result: number;
    total: number;
    feedback: string;
  };
};

type SessionState = "setup" | "running" | "report";

export default function InterviewPage() {
  const [state, setState] = useState<SessionState>("setup");
  const [analysisId, setAnalysisId] = useState("");
  const [persona, setPersona] = useState<PersonaKey>("hiring_manager");
  const [interviewId, setInterviewId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [currentDifficulty, setCurrentDifficulty] = useState(2);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const transcriptRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<{
    continuous: boolean;
    interimResults: boolean;
    onresult: ((event: {
      resultIndex: number;
      results: { length: number; [i: number]: { isFinal: boolean; [0]: { transcript: string } } };
    }) => void) | null;
    onerror: (() => void) | null;
    start: () => void;
    stop: () => void;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAnalysisId(params.get("analysisId") ?? "");
  }, []);

  useEffect(() => {
    const SR = (window as Window & {
      SpeechRecognition?: new () => NonNullable<typeof recognitionRef.current>;
      webkitSpeechRecognition?: new () => NonNullable<typeof recognitionRef.current>;
    }).SpeechRecognition ??
      (window as Window & {
        SpeechRecognition?: new () => NonNullable<typeof recognitionRef.current>;
        webkitSpeechRecognition?: new () => NonNullable<typeof recognitionRef.current>;
      }).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: {
      resultIndex: number;
      results: { length: number; [i: number]: { isFinal: boolean; [0]: { transcript: string } } };
    }) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += text;
        else interimText += text;
      }
      if (finalText) setCurrentInput((prev) => `${prev} ${finalText}`.trim());
      setLiveTranscript(interimText);
    };
    recognition.onerror = () => {
      setIsRecording(false);
      setLiveTranscript("");
    };
    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, []);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages, liveTranscript]);

  const personaCards = useMemo(
    () => (Object.entries(PERSONAS) as [PersonaKey, (typeof PERSONAS)[PersonaKey]][]),
    []
  );

  async function startInterview() {
    setLoading(true);
    setError("");
    try {
      let userId = localStorage.getItem("talentos_user_id");
      if (!userId) {
        userId = `guest_${Date.now()}`;
        localStorage.setItem("talentos_user_id", userId);
      }
      if (!analysisId) throw new Error("Missing analysisId in URL");
      const response = await fetch("/api/talentos/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId, persona, userId }),
      });
      if (!response.ok) throw new Error("Failed to start interview");
      const data = (await response.json()) as {
        interviewId: string;
        messages: Message[];
        questionDifficulty: number;
      };
      setInterviewId(data.interviewId);
      setMessages(data.messages);
      setCurrentDifficulty(Math.max(1, Math.min(5, data.questionDifficulty || 2)));
      setState("running");
    } catch (err) {
      console.error(err);
      setError("Failed to start interview. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function sendResponse() {
    if (!currentInput.trim() || !interviewId || loading) return;
    const userMsg: Message = {
      role: "candidate",
      content: currentInput.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    const userMessage = currentInput;
    setCurrentInput("");
    setLiveTranscript("");
    setLoading(true);
    try {
      const response = await fetch("/api/talentos/interview/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId, message: userMessage }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      const data = (await response.json()) as {
        evaluation: Message["evaluation"];
        response: string;
        questionCategory: string;
        questionDifficulty: number;
        nextAction: string;
      };
      setCurrentDifficulty(Math.max(1, Math.min(5, data.questionDifficulty || 2)));
      setMessages((prev) => [
        ...prev,
        {
          role: "interviewer",
          content: data.response,
          timestamp: new Date().toISOString(),
          category: data.questionCategory,
          difficulty: data.questionDifficulty,
          evaluation: data.evaluation,
        },
      ]);
      if (data.nextAction === "wrap_up") {
        setError("Interviewer suggests wrapping up. Click End Interview for report.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to process response. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function endInterview() {
    if (!interviewId) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/talentos/interview/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId }),
      });
      if (!response.ok) throw new Error("Failed to end interview");
      const data = (await response.json()) as Record<string, unknown>;
      setReport(data);
      setState("report");
    } catch (err) {
      console.error(err);
      setError("Unable to generate report right now.");
    } finally {
      setLoading(false);
    }
  }

  function toggleRecording() {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isRecording) {
      rec.stop();
      setIsRecording(false);
    } else {
      rec.start();
      setIsRecording(true);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[length:4rem_4rem] pointer-events-none" />

      <nav className="relative z-50 border-b border-white/5 backdrop-blur-xl bg-black/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-bold font-[family-name:var(--font-space)]">TalentOS</span>
              <span className="text-xs text-zinc-500 block">Interview Room</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((d) => (
              <Star
                key={d}
                size={14}
                className={d <= currentDifficulty ? "text-amber-400 fill-amber-400" : "text-zinc-600"}
              />
            ))}
          </div>
        </div>
      </nav>

      <main className="relative max-w-6xl mx-auto px-6 py-8">
        {state === "setup" ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-space)] mb-3">
              Choose Interview Persona
            </h1>
            <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
              Pick the round you want to practice. The interview adapts based on your responses.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
              {personaCards.map(([key, p]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPersona(key)}
                  className={`rounded-xl border p-5 transition-all ${
                    persona === key
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Bot size={16} className="text-cyan-400" />
                    <p className="text-white font-semibold">{p.name}</p>
                  </div>
                  <p className="text-zinc-400 text-sm">{p.title}</p>
                  <p className="text-zinc-500 text-xs mt-2">{p.roundName}</p>
                  <p className="text-zinc-300 text-sm mt-3">{p.style}</p>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={startInterview}
              disabled={loading || !analysisId}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Crown size={20} />
                  Start {PERSONAS[persona].roundName}
                </>
              )}
            </button>
            {!analysisId && (
              <p className="text-amber-400 text-sm mt-4">Missing analysisId. Start from the analysis page.</p>
            )}
            {error && (
              <p className="text-red-400 mt-4 flex items-center justify-center gap-2">
                <AlertCircle size={16} />
                {error}
              </p>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#0A0A0A] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-zinc-400 text-sm">
                  Interviewer: <span className="text-white">{PERSONAS[persona].name}</span>
                </p>
                <button
                  type="button"
                  onClick={endInterview}
                  disabled={loading || state === "report"}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-sm hover:bg-red-500/30 disabled:opacity-50"
                >
                  End Interview
                </button>
              </div>
              <div
                ref={transcriptRef}
                className="h-[55vh] overflow-y-auto p-2 rounded-xl bg-black/20 border border-white/5 space-y-4"
              >
                {messages.map((m, i) => (
                  <motion.div key={`${m.timestamp}-${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className={`flex gap-3 ${m.role === "candidate" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.role === "candidate" ? "bg-purple-500/20" : "bg-cyan-500/20"}`}>
                        {m.role === "candidate" ? <User size={16} className="text-purple-300" /> : <Bot size={16} className="text-cyan-300" />}
                      </div>
                      <div className={`max-w-[78%] rounded-xl p-3 ${m.role === "candidate" ? "bg-purple-500/10" : "bg-white/5"}`}>
                        <p className="text-zinc-100 whitespace-pre-wrap">{m.content}</p>
                        {m.category ? <p className="text-xs text-zinc-500 mt-1">{m.category}</p> : null}
                        {m.evaluation ? (
                          <div className="mt-3 rounded-lg bg-white/5 p-3">
                            <p className="text-xs text-zinc-400 mb-2">STAR score ({m.evaluation.total}/100)</p>
                            {(["situation", "task", "action", "result"] as const).map((k) => (
                              <div key={k} className="mb-1.5">
                                <div className="flex justify-between text-[11px] text-zinc-400">
                                  <span className="capitalize">{k}</span>
                                  <span>{m.evaluation?.[k]}/25</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${((m.evaluation?.[k] ?? 0) / 25) * 100}%` }} />
                                </div>
                              </div>
                            ))}
                            <p className="text-xs text-zinc-300 mt-2">{m.evaluation.feedback}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <AnimatePresence>
                  {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-500 text-sm flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Thinking...
                    </motion.div>
                  )}
                </AnimatePresence>
                {liveTranscript ? <p className="text-cyan-300 text-sm italic">Live: {liveTranscript}</p> : null}
              </div>

              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`p-4 rounded-xl transition-all ${isRecording ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-white/5 text-zinc-300 hover:bg-white/10"}`}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <textarea
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendResponse();
                    }
                  }}
                  placeholder="Write your answer..."
                  className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-cyan-500/50 transition-all"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={() => void sendResponse()}
                  disabled={!currentInput.trim() || loading}
                  className="px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium disabled:opacity-50 flex items-center"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/5">
                <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-medium mb-2">Adaptive Difficulty</h4>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <div key={d} className={`h-2 flex-1 rounded-full ${d <= currentDifficulty ? "bg-cyan-500" : "bg-white/10"}`} />
                  ))}
                </div>
                <p className="text-zinc-400 text-xs mt-2">Current Level: {currentDifficulty}/5</p>
              </div>
              {error ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5" />
                  <span>{error}</span>
                </div>
              ) : null}
              {state === "report" && report ? (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    Jarvis Report
                  </h3>
                  <pre className="text-xs text-zinc-300 whitespace-pre-wrap">{JSON.stringify(report, null, 2)}</pre>
                  {analysisId ? (
                    <Link
                      href={`/prep?analysisId=${analysisId}`}
                      className="inline-block mt-3 px-3 py-2 rounded-lg bg-purple-500/20 text-purple-100 hover:bg-purple-500/30 text-sm"
                    >
                      Open Prep Guide
                    </Link>
                  ) : null}
                </div>
              ) : null}
              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-zinc-300">
                Use STAR: Situation, Task, Action, Result. Include clear outcomes and metrics.
              </div>
            </div>
          </div>
        )} 
      </main>
    </div>
  );
}

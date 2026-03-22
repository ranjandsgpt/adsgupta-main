"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Bot,
  User,
  Loader2,
  Play,
  Volume2,
  VolumeX,
  Clock,
  CheckCircle2,
  AlertCircle,
  Brain,
  Star,
  ArrowRight,
  Home,
  X,
} from "lucide-react";

const STATES = {
  IDLE: "IDLE",
  USER_LISTENING: "USER_LISTENING",
  ANALYZING: "ANALYZING",
  COMPLETED: "COMPLETED",
} as const;

type State = (typeof STATES)[keyof typeof STATES];

function AudioVisualizer({ isActive, intensity = 0.5 }: { isActive: boolean; intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const baseRadius = 40;
      const numCircles = 4;
      const time = Date.now() / 1000;

      for (let i = 0; i < numCircles; i++) {
        const phase = (i / numCircles) * Math.PI * 2;
        const pulse = isActive ? Math.sin(time * 3 + phase) * intensity * 20 : 0;
        const radius = baseRadius + i * 15 + pulse;
        const alpha = isActive ? 0.3 - i * 0.05 : 0.1;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50);
      gradient.addColorStop(0, isActive ? "rgba(6, 182, 212, 0.4)" : "rgba(6, 182, 212, 0.1)");
      gradient.addColorStop(1, "rgba(6, 182, 212, 0)");

      ctx.beginPath();
      ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, intensity]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    />
  );
}

function STARScores({ scores }: { scores: Record<string, number> | null }) {
  const items = [
    { key: "situation", label: "Situation", color: "from-cyan-500 to-cyan-400" },
    { key: "task", label: "Task", color: "from-blue-500 to-blue-400" },
    { key: "action", label: "Action", color: "from-purple-500 to-purple-400" },
    { key: "result", label: "Result", color: "from-pink-500 to-pink-400" },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-medium">STAR Score</h4>
      {items.map(({ key, label, color }) => (
        <div key={key} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">{label}</span>
            <span className="text-white font-mono">{scores?.[key] ?? 0}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${scores?.[key] ?? 0}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full bg-gradient-to-r ${color}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TranscriptMessage({ message, isUser }: { message: { content: string; category?: string }; isUser: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-purple-500/20" : "bg-cyan-500/20"
        }`}
      >
        {isUser ? <User size={16} className="text-purple-400" /> : <Bot size={16} className="text-cyan-400" />}
      </div>
      <div
        className={`max-w-[80%] p-3 rounded-xl ${
          isUser ? "bg-purple-500/10 text-purple-100" : "bg-white/5 text-zinc-300"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        {message.category && <span className="text-xs text-zinc-500 mt-1 block">{message.category}</span>}
      </div>
    </motion.div>
  );
}

export default function InterviewPage() {
  const [state, setState] = useState<State>(STATES.IDLE);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<{ role: string; content: string; category?: string }[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [starScores, setStarScores] = useState<Record<string, number> | null>(null);
  const [fillerCount, setFillerCount] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const transcriptRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Web Speech API
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const w = window as Window & {
      webkitSpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        onresult: ((ev: Event) => void) | null;
        onerror: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
      SpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        onresult: ((ev: Event) => void) | null;
        onerror: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
    };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: Event) => {
      const ev = event as unknown as {
        resultIndex: number;
        results: { length: number; [i: number]: { isFinal: boolean; [0]: { transcript: string } } };
      };
      let finalTranscript = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const t = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) finalTranscript += t;
      }
      if (finalTranscript) setCurrentInput((prev) => prev + finalTranscript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, []);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const startInterview = async () => {
    setIsLoading(true);
    setError("");
    try {
      let userId = localStorage.getItem("talentos_user_id");
      if (!userId) {
        userId = `guest_${Date.now()}`;
        localStorage.setItem("talentos_user_id", userId);
      }
      const response = await fetch("/api/talentos/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, mode: "adtech" }),
      });
      if (!response.ok) throw new Error("Failed to start interview");
      const data = (await response.json()) as {
        session_id: string;
        first_question: string;
        category: string;
      };
      setSessionId(data.session_id);
      setTranscript([
        {
          role: "interviewer",
          content: data.first_question,
          category: data.category,
        },
      ]);
      setState(STATES.USER_LISTENING);
    } catch (err) {
      console.error(err);
      setError("Failed to start interview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendResponse = async () => {
    if (!currentInput.trim() || !sessionId) return;
    setState(STATES.ANALYZING);
    setTranscript((prev) => [...prev, { role: "user", content: currentInput }]);
    const userMessage = currentInput;
    setCurrentInput("");

    try {
      const response = await fetch("/api/talentos/interview/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, user_message: userMessage }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      const data = (await response.json()) as {
        response: string;
        star_scores: Record<string, number>;
        filler_count: number;
        status: string;
        question_index: number;
        category: string;
      };

      setStarScores(data.star_scores);
      setFillerCount((prev) => prev + data.filler_count);
      setQuestionIndex(data.question_index);
      setTranscript((prev) => [
        ...prev,
        { role: "interviewer", content: data.response, category: data.category },
      ]);

      if (data.status === "completed") {
        setState(STATES.COMPLETED);
        setOverallScore(
          Math.round(Object.values(data.star_scores).reduce((a, b) => a + b, 0) / 4)
        );
      } else {
        setState(STATES.USER_LISTENING);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to process response. Please try again.");
      setState(STATES.USER_LISTENING);
    }
  };

  const toggleRecording = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isRecording) {
      rec.stop();
      setIsRecording(false);
    } else {
      rec.start();
      setIsRecording(true);
    }
  };

  // AI "speaking" visual — not wired to TTS; keep UX similar to CRA
  const aiActive = state === STATES.ANALYZING;

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

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Clock size={16} />
              <span>Q{questionIndex + 1}/5</span>
            </div>
            {state !== STATES.IDLE && (
              <Link
                href="/workspace"
                className="px-4 py-2 rounded-lg bg-white/5 text-zinc-400 text-sm hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <X size={16} />
                Exit
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="relative max-w-6xl mx-auto px-6 py-8">
        {state === STATES.IDLE ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 relative">
              <AudioVisualizer isActive={false} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Bot size={40} className="text-cyan-400" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-space)] mb-4">
              Mock Interview Room
            </h1>
            <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
              Practice with our AI interviewer trained on ad-tech hiring patterns. Get real-time STAR method scoring and
              personalized feedback.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
              {[
                { icon: Brain, label: "5 Technical Questions", desc: "Adtech focused" },
                { icon: Star, label: "STAR Method Scoring", desc: "Real-time feedback" },
                { icon: Mic, label: "Voice or Type", desc: "Your choice" },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <item.icon size={24} className="text-cyan-400 mb-2" />
                  <p className="text-white font-medium text-sm">{item.label}</p>
                  <p className="text-zinc-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={startInterview}
              disabled={isLoading}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
              data-testid="start-interview-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play size={20} />
                  Start Interview
                </>
              )}
            </button>
            {error && (
              <p className="text-red-400 mt-4 flex items-center justify-center gap-2">
                <AlertCircle size={16} />
                {error}
              </p>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="w-16 h-16 relative">
                  <AudioVisualizer isActive={aiActive} intensity={0.7} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Bot size={24} className="text-cyan-400" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-medium">AI Interviewer</p>
                  <p className="text-zinc-500 text-sm">
                    {state === STATES.ANALYZING
                      ? "Analyzing your response..."
                      : state === STATES.COMPLETED
                        ? "Interview Complete"
                        : "Listening..."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="ml-auto p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                >
                  {isMuted ? <VolumeX size={18} className="text-zinc-400" /> : <Volume2 size={18} className="text-zinc-400" />}
                </button>
              </div>

              <div
                ref={transcriptRef}
                className="h-[400px] overflow-y-auto p-4 rounded-xl bg-[#0A0A0A] border border-white/5 space-y-4"
              >
                {transcript.map((msg, i) => (
                  <TranscriptMessage key={i} message={msg} isUser={msg.role === "user"} />
                ))}
                {state === STATES.ANALYZING && (
                  <div className="flex items-center gap-2 text-zinc-500 text-sm">
                    <Loader2 size={14} className="animate-spin" />
                    Analyzing response...
                  </div>
                )}
              </div>

              {state === STATES.USER_LISTENING && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`p-4 rounded-xl transition-all ${
                      isRecording
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-white/5 text-zinc-400 hover:bg-white/10"
                    }`}
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
                    placeholder="Type your answer or use voice..."
                    className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-cyan-500/50 transition-all"
                    rows={3}
                    data-testid="interview-input"
                  />
                  <button
                    type="button"
                    onClick={() => void sendResponse()}
                    disabled={!currentInput.trim()}
                    className="px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium disabled:opacity-50 transition-all flex items-center gap-2"
                    data-testid="send-answer-btn"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {state === STATES.COMPLETED && (
                <div className="flex gap-3">
                  <Link
                    href="/workspace"
                    className="flex-1 py-4 rounded-xl bg-white/5 text-white font-medium text-center hover:bg-white/10 transition-all"
                  >
                    <Home size={18} className="inline mr-2" />
                    Back to Workspace
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSessionId(null);
                      setTranscript([]);
                      setState(STATES.IDLE);
                      setStarScores(null);
                      setFillerCount(0);
                      setQuestionIndex(0);
                      setOverallScore(null);
                    }}
                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all"
                    data-testid="retry-interview-btn"
                  >
                    <Play size={18} className="inline mr-2" />
                    Try Again
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/5">
                <STARScores scores={starScores} />
              </div>
              <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/5 space-y-4">
                <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Session Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Questions</span>
                    <span className="text-white">{questionIndex}/5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Filler Words</span>
                    <span className={fillerCount > 5 ? "text-amber-400" : "text-emerald-400"}>{fillerCount}</span>
                  </div>
                  {overallScore !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Overall Score</span>
                      <span className="text-cyan-400 font-bold">{overallScore}%</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <h4 className="text-cyan-400 text-sm font-medium mb-2">Pro Tips</h4>
                <ul className="text-zinc-400 text-xs space-y-1">
                  <li>• Use specific examples with numbers</li>
                  <li>• Structure answers: Situation → Action → Result</li>
                  <li>• Avoid filler words (um, like, basically)</li>
                  <li>• Keep answers 1-2 minutes</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

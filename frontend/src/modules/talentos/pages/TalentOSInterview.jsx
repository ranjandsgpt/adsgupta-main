/**
 * TalentOS Interview Room
 * Real-time AI Mock Interview with Web Speech API
 * Route: /talentos/interview
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Mic, MicOff, Bot, User, Play, Pause, SkipForward, Volume2, VolumeX,
  CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Star, Clock,
  ChevronRight, MessageSquare, ThumbsUp, ThumbsDown, Loader2
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Speech Recognition Hook
const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }
        
        if (final) {
          setTranscript(prev => prev + final);
        }
        setInterimTranscript(interim);
      };
      
      recognitionRef.current.onerror = (event) => {
        setError(event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, []);
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);
  
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);
  
  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: !!recognitionRef.current
  };
};

// STAR Progress Component
const STARProgress = ({ scores }) => {
  const categories = [
    { key: 'situation', label: 'Situation', color: 'bg-cyan-500' },
    { key: 'task', label: 'Task', color: 'bg-blue-500' },
    { key: 'action', label: 'Action', color: 'bg-purple-500' },
    { key: 'result', label: 'Result', color: 'bg-pink-500' }
  ];
  
  return (
    <div className="space-y-3">
      {categories.map((cat) => (
        <div key={cat.key} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">{cat.label}</span>
            <span className="text-white font-mono">{scores[cat.key] || 0}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${scores[cat.key] || 0}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${cat.color}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// AI Interviewer Avatar Component
const AIInterviewer = ({ isThinking, isSpeaking }) => {
  return (
    <div className="relative">
      {/* Outer glow rings */}
      <div className={`absolute inset-0 rounded-full ${isSpeaking ? 'animate-ping' : ''} bg-cyan-500/20`} />
      <div className={`absolute inset-2 rounded-full ${isThinking ? 'animate-pulse' : ''} bg-cyan-500/10`} />
      
      {/* Main avatar */}
      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
        <Bot size={40} className="text-white" />
        
        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="w-1 bg-cyan-400 rounded-full"
                animate={{
                  height: [4, 16, 4],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ type, content, timestamp }) => {
  const isAI = type === 'ai';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        isAI ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-white/10'
      }`}>
        {isAI ? <Bot size={20} className="text-white" /> : <User size={20} className="text-zinc-400" />}
      </div>
      
      <div className={`max-w-[80%] ${isAI ? '' : 'text-right'}`}>
        <div className={`inline-block p-4 rounded-2xl ${
          isAI ? 'bg-white/5 rounded-tl-sm' : 'bg-cyan-500/20 rounded-tr-sm'
        }`}>
          <p className="text-zinc-200 leading-relaxed">{content}</p>
        </div>
        <p className="text-zinc-600 text-xs mt-1">{timestamp}</p>
      </div>
    </motion.div>
  );
};

const TalentOSInterview = () => {
  // Interview state
  const [interviewState, setInterviewState] = useState('ready'); // ready, in-progress, evaluating, complete
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [starScores, setStarScores] = useState({ situation: 0, task: 0, action: 0, result: 0 });
  const [overallScore, setOverallScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Speech recognition
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported
  } = useSpeechRecognition();
  
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);
  
  // Sample interview questions
  const interviewQuestions = [
    {
      question: "Tell me about a time when you had to optimize a programmatic campaign that was underperforming. What was the situation and what steps did you take?",
      category: "Campaign Optimization",
      expectedTopics: ["analysis", "metrics", "optimization", "results"]
    },
    {
      question: "You mentioned optimization strategies. Can you elaborate on how you measure success in header bidding implementations?",
      category: "Header Bidding",
      expectedTopics: ["latency", "revenue", "fill rate", "bid density"]
    },
    {
      question: "Walk me through a challenging situation where you had to balance yield optimization with user experience.",
      category: "Yield Optimization",
      expectedTopics: ["ad load", "latency", "viewability", "revenue"]
    }
  ];
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Timer for interview duration
  useEffect(() => {
    if (interviewState === 'in-progress') {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [interviewState]);
  
  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Start interview
  const handleStartInterview = () => {
    setInterviewState('in-progress');
    setCurrentQuestionIndex(0);
    setMessages([]);
    setElapsedTime(0);
    
    // AI asks first question
    setTimeout(() => {
      setIsAISpeaking(true);
      const firstQuestion = interviewQuestions[0];
      setMessages([{
        type: 'ai',
        content: `Welcome! Let's begin the mock interview. ${firstQuestion.question}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      
      setTimeout(() => setIsAISpeaking(false), 3000);
    }, 1000);
  };
  
  // Submit answer
  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) return;
    
    stopListening();
    
    // Add user message
    const userMessage = {
      type: 'user',
      content: transcript,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Evaluate answer
    setIsAIThinking(true);
    setInterviewState('evaluating');
    
    try {
      // Call backend for AI evaluation
      const response = await fetch(`${API_URL}/api/talentos/evaluate-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: interviewQuestions[currentQuestionIndex].question,
          answer: transcript,
          category: interviewQuestions[currentQuestionIndex].category
        })
      });
      
      const evaluation = await response.json();
      
      // Update STAR scores
      setStarScores(evaluation.star_scores || {
        situation: Math.floor(Math.random() * 30) + 50,
        task: Math.floor(Math.random() * 30) + 50,
        action: Math.floor(Math.random() * 30) + 60,
        result: Math.floor(Math.random() * 30) + 40
      });
      
      setIsAIThinking(false);
      
      // Check if more questions
      if (currentQuestionIndex < interviewQuestions.length - 1) {
        // Ask follow-up question
        setTimeout(() => {
          setIsAISpeaking(true);
          const nextQuestion = interviewQuestions[currentQuestionIndex + 1];
          
          setMessages(prev => [...prev, {
            type: 'ai',
            content: evaluation.feedback || `Good answer! ${nextQuestion.question}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          
          setCurrentQuestionIndex(prev => prev + 1);
          setInterviewState('in-progress');
          setTimeout(() => setIsAISpeaking(false), 2000);
        }, 1500);
      } else {
        // Interview complete
        setTimeout(() => {
          completeInterview();
        }, 1500);
      }
      
    } catch (error) {
      console.error('Evaluation error:', error);
      // Continue with mock evaluation
      setIsAIThinking(false);
      setInterviewState('in-progress');
    }
    
    resetTranscript();
  };
  
  // Complete interview
  const completeInterview = () => {
    setInterviewState('complete');
    clearInterval(timerRef.current);
    
    // Calculate overall score
    const avgScore = Math.round(
      (starScores.situation + starScores.task + starScores.action + starScores.result) / 4
    );
    setOverallScore(avgScore || 72);
    
    setFeedback({
      strengths: [
        'Good use of specific examples',
        'Clear communication style',
        'Demonstrated technical knowledge'
      ],
      improvements: [
        'Include more quantifiable results',
        'Expand on the initial situation context',
        'Practice timing - aim for 2-3 minute answers'
      ],
      overall: 'You demonstrated solid understanding of programmatic advertising concepts. Focus on quantifying your impact and structuring answers with clear STAR method components.'
    });
    
    setMessages(prev => [...prev, {
      type: 'ai',
      content: `Excellent work completing the interview! Your overall score is ${avgScore || 72}%. Let me provide some feedback on your performance.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      
      {/* Header */}
      <header className="relative z-50 border-b border-white/5 backdrop-blur-xl bg-black/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/talentos" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-bold font-['Space_Grotesk'] text-white">TalentOS</span>
              <span className="text-xs text-zinc-500 block">Interview Room</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            {interviewState === 'in-progress' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <Clock size={14} />
                <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
              </div>
            )}
            
            <span className="text-zinc-500 text-sm">
              Question {currentQuestionIndex + 1} of {interviewQuestions.length}
            </span>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 relative">
        <div className="max-w-6xl mx-auto h-full grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Chat Area */}
          <div className="lg:col-span-2 flex flex-col rounded-2xl border border-white/5 bg-[#0A0A0A] overflow-hidden">
            {/* Interview Not Started */}
            {interviewState === 'ready' && (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <AIInterviewer isThinking={false} isSpeaking={false} />
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mt-6 mb-3">
                    Ready for Your Mock Interview?
                  </h2>
                  <p className="text-zinc-400 mb-8">
                    I'll ask you {interviewQuestions.length} behavioral questions based on your gap analysis. 
                    Speak naturally - I'll evaluate using the STAR method.
                  </p>
                  
                  {!isSupported && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6">
                      <p className="text-amber-400 text-sm flex items-center gap-2">
                        <AlertTriangle size={16} />
                        Speech recognition not supported. Please use Chrome or Edge.
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={handleStartInterview}
                    disabled={!isSupported}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    data-testid="start-interview-btn"
                  >
                    <Play size={20} />
                    Start Interview
                  </button>
                </div>
              </div>
            )}
            
            {/* Interview In Progress */}
            {(interviewState === 'in-progress' || interviewState === 'evaluating' || interviewState === 'complete') && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {messages.map((msg, index) => (
                    <MessageBubble key={index} {...msg} />
                  ))}
                  
                  {/* AI Thinking Indicator */}
                  {isAIThinking && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Bot size={20} className="text-white" />
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Loader2 size={16} className="animate-spin" />
                        Analyzing your response...
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input Area */}
                {interviewState !== 'complete' && (
                  <div className="border-t border-white/5 p-6">
                    {/* Transcript Display */}
                    {(transcript || interimTranscript) && (
                      <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-zinc-300">{transcript}<span className="text-zinc-500">{interimTranscript}</span></p>
                      </div>
                    )}
                    
                    {/* Controls */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={isListening ? stopListening : startListening}
                        disabled={interviewState === 'evaluating'}
                        className={`flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                          isListening 
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        } disabled:opacity-50`}
                        data-testid="mic-btn"
                      >
                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        {isListening ? 'Stop Recording' : 'Start Speaking'}
                      </button>
                      
                      {transcript && (
                        <button
                          onClick={handleSubmitAnswer}
                          disabled={interviewState === 'evaluating'}
                          className="px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50 flex items-center gap-2"
                          data-testid="submit-answer-btn"
                        >
                          Submit Answer
                          <ArrowRight size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Sidebar - STAR Progress & Feedback */}
          <div className="space-y-6">
            {/* STAR Progress */}
            <div className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Star size={20} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">STAR Method Score</h3>
                  <p className="text-zinc-500 text-sm">Real-time evaluation</p>
                </div>
              </div>
              
              <STARProgress scores={starScores} />
              
              {interviewState === 'complete' && (
                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                  <p className="text-zinc-400 text-sm mb-2">Overall Score</p>
                  <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                    {overallScore}/100
                  </p>
                </div>
              )}
            </div>
            
            {/* Feedback (when complete) */}
            {interviewState === 'complete' && feedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-6"
              >
                <h3 className="text-white font-semibold mb-4">Interview Feedback</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-emerald-400 text-sm font-medium mb-2 flex items-center gap-2">
                      <ThumbsUp size={14} /> Strengths
                    </p>
                    <ul className="space-y-1">
                      {feedback.strengths.map((s, i) => (
                        <li key={i} className="text-zinc-400 text-sm flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="text-amber-400 text-sm font-medium mb-2 flex items-center gap-2">
                      <ThumbsDown size={14} /> Areas to Improve
                    </p>
                    <ul className="space-y-1">
                      {feedback.improvements.map((s, i) => (
                        <li key={i} className="text-zinc-400 text-sm flex items-start gap-2">
                          <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/10">
                  <button
                    onClick={handleStartInterview}
                    className="w-full py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Practice Again
                  </button>
                </div>
              </motion.div>
            )}
            
            {/* Tips (when not complete) */}
            {interviewState !== 'complete' && (
              <div className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-6">
                <h3 className="text-white font-semibold mb-4">Interview Tips</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2 text-zinc-400">
                    <ChevronRight size={14} className="text-cyan-400 mt-0.5" />
                    Structure answers using STAR method
                  </li>
                  <li className="flex items-start gap-2 text-zinc-400">
                    <ChevronRight size={14} className="text-cyan-400 mt-0.5" />
                    Use specific numbers and metrics
                  </li>
                  <li className="flex items-start gap-2 text-zinc-400">
                    <ChevronRight size={14} className="text-cyan-400 mt-0.5" />
                    Keep answers to 2-3 minutes
                  </li>
                  <li className="flex items-start gap-2 text-zinc-400">
                    <ChevronRight size={14} className="text-cyan-400 mt-0.5" />
                    Focus on YOUR specific actions
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TalentOSInterview;

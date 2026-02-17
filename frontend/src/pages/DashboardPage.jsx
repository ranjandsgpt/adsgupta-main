import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Settings, TrendingUp, DollarSign, ShoppingCart, 
  BarChart3, RefreshCw, AlertCircle, CheckCircle2, Loader2, 
  LogOut, User, Sparkles, ArrowUpRight, ArrowDownRight,
  Eye, MousePointer, Package, Target, Zap, ChevronDown
} from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '../components/Footer';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// KPI Card Component
const KPICard = ({ title, value, change, changeType, icon: Icon, color, prefix = '', suffix = '' }) => {
  const isPositive = changeType === 'positive';
  const isNeutral = changeType === 'neutral';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-5 hover:-translate-y-0.5 transition-transform"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${color} bg-opacity-20 flex items-center justify-center`}>
          <Icon size={20} className={color.replace('bg-', 'text-')} strokeWidth={1.5} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium
            ${isNeutral ? 'text-zinc-400' : isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {!isNeutral && (isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />)}
            {change}%
          </div>
        )}
      </div>
      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-bold text-white font-['Space_Grotesk']">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>
    </motion.div>
  );
};

// AI Insights Panel Component
const AIInsightsPanel = ({ insights, loading, onRefresh }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
            <Sparkles size={20} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold font-['Space_Grotesk']">AI Insights</h3>
            <p className="text-zinc-500 text-xs">Powered by Gemini 3 Flash</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="text-cyan-400 animate-spin" />
        </div>
      ) : insights ? (
        <div className="prose prose-invert prose-sm max-w-none">
          <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
            {insights}
          </div>
        </div>
      ) : (
        <p className="text-zinc-500 text-sm text-center py-6">
          Connect your Amazon account to get AI-powered insights
        </p>
      )}
    </motion.div>
  );
};

// Amazon Connection Status Component
const ConnectionStatus = ({ status, onConnect, onDisconnect, redirectUri }) => {
  const isConnected = status?.connected;
  
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'} 
            shadow-[0_0_8px] ${isConnected ? 'shadow-emerald-400/50' : 'shadow-rose-400/50'}`} />
          <div>
            <p className="text-white font-medium text-sm">Amazon Account</p>
            <p className="text-zinc-500 text-xs">
              {isConnected ? `Connected • ${status.selling_partner_id || 'Active'}` : 'Not connected'}
            </p>
          </div>
        </div>
        
        {isConnected ? (
          <button
            onClick={onDisconnect}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-all"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={onConnect}
            className="px-4 py-2 rounded-lg bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)]"
          >
            Connect Amazon
          </button>
        )}
      </div>
      
      {!isConnected && redirectUri && (
        <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-zinc-500 text-xs mb-1">Redirect URI for Amazon Developer Console:</p>
          <code className="text-cyan-400 text-xs break-all">{redirectUri}</code>
        </div>
      )}
    </div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // login or register
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState('');
  
  // Dashboard state
  const [amazonStatus, setAmazonStatus] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [insights, setInsights] = useState(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [fetchingReports, setFetchingReports] = useState(false);
  
  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);
  
  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('amazon_connected') === 'true') {
      fetchAmazonStatus();
      // Clean URL
      navigate('/dashboard', { replace: true });
    }
  }, [location, navigate]);
  
  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        fetchAmazonStatus();
        fetchKPIs();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setAuthLoading(false);
    }
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setShowAuthModal(false);
        fetchAmazonStatus();
        fetchKPIs();
      } else {
        const error = await response.json();
        setAuthError(error.detail || 'Login failed');
      }
    } catch (error) {
      setAuthError('Network error. Please try again.');
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password,
          name: authForm.name
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setShowAuthModal(false);
        fetchAmazonStatus();
      } else {
        const error = await response.json();
        setAuthError(error.detail || 'Registration failed');
      }
    } catch (error) {
      setAuthError('Network error. Please try again.');
    }
  };
  
  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/marketplacesolutions';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };
  
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setAmazonStatus(null);
    setKpis(null);
    setInsights(null);
  };
  
  const fetchAmazonStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/amazon/status`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAmazonStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch Amazon status:', error);
    }
  };
  
  const fetchKPIs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/dashboard/kpis?period=${period}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setKpis(data);
      }
    } catch (error) {
      console.error('Failed to fetch KPIs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchInsights = async () => {
    if (!kpis?.kpis) return;
    
    setInsightsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/ai/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          metrics: kpis.kpis,
          period: period === '7d' ? 'last_7_days' : period === '30d' ? 'last_30_days' : 'last_90_days'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setInsightsLoading(false);
    }
  };
  
  const connectAmazon = async () => {
    try {
      const response = await fetch(`${API_URL}/api/amazon/connect`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authorization_url) {
          window.location.href = data.authorization_url;
        }
      }
    } catch (error) {
      console.error('Failed to start Amazon connection:', error);
    }
  };
  
  const disconnectAmazon = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Amazon account?')) return;
    
    try {
      await fetch(`${API_URL}/api/amazon/disconnect`, {
        method: 'POST',
        credentials: 'include'
      });
      setAmazonStatus({ connected: false });
      setKpis(null);
      setInsights(null);
    } catch (error) {
      console.error('Failed to disconnect Amazon:', error);
    }
  };
  
  const triggerReportFetch = async () => {
    setFetchingReports(true);
    try {
      const response = await fetch(`${API_URL}/api/amazon/fetch-reports`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Refresh KPIs after a delay
        setTimeout(() => {
          fetchKPIs();
          setFetchingReports(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to trigger report fetch:', error);
      setFetchingReports(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchKPIs();
    }
  }, [period, user]);
  
  // Handle session_id from Emergent OAuth
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('session_id=')) {
      const sessionId = hash.split('session_id=')[1]?.split('&')[0];
      if (sessionId) {
        processGoogleSession(sessionId);
      }
    }
  }, []);
  
  const processGoogleSession = async (sessionId) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ session_id: sessionId })
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        // Clean URL
        window.history.replaceState(null, '', window.location.pathname);
        fetchAmazonStatus();
        fetchKPIs();
      }
    } catch (error) {
      console.error('Failed to process Google session:', error);
    }
  };
  
  const k = kpis?.kpis || {};
  
  // Auth Modal
  const AuthModal = () => (
    <AnimatePresence>
      {showAuthModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowAuthModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card rounded-2xl p-8 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-2">
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-zinc-400 text-sm mb-6">
              {authMode === 'login' ? 'Sign in to access your dashboard' : 'Start your 14-day free trial'}
            </p>
            
            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-all mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-zinc-500 text-xs">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            
            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
              {authMode === 'register' && (
                <div className="mb-4">
                  <label className="block text-zinc-400 text-sm mb-2">Name</label>
                  <input
                    type="text"
                    value={authForm.name}
                    onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
                    placeholder="Your name"
                    required
                  />
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-zinc-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
                  placeholder="you@company.com"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-zinc-400 text-sm mb-2">Password</label>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              
              {authError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                  {authError}
                </div>
              )}
              
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)]"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
            
            <p className="text-center text-zinc-500 text-sm mt-6">
              {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthError('');
                }}
                className="text-cyan-400 hover:text-cyan-300"
              >
                {authMode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <Loader2 size={40} className="text-cyan-400 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#121212] relative">
      <div className="grain-overlay" />
      <Navigation />
      <MobileNav />
      
      <main className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8"
          >
            <div>
              <span className="text-cyan-400 text-sm font-medium tracking-widest uppercase mb-2 block">
                Amazon Analytics
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
                Seller Dashboard
              </h1>
              {user && (
                <p className="text-zinc-400 mt-1">Welcome back, {user.name}</p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {/* Period Selector */}
                  <div className="relative">
                    <select
                      value={period}
                      onChange={e => setPeriod(e.target.value)}
                      className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white text-sm cursor-pointer focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="90d">Last 90 Days</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  </div>
                  
                  {/* Refresh Button */}
                  <button
                    onClick={triggerReportFetch}
                    disabled={fetchingReports || !amazonStatus?.connected}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={fetchingReports ? 'animate-spin' : ''} />
                    Fetch Now
                  </button>
                  
                  {/* User Menu */}
                  <button
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)]"
                >
                  Login with AdsGupta
                </button>
              )}
            </div>
          </motion.div>
          
          {!user ? (
            // Not logged in - Show CTA
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-12 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-6">
                <LayoutDashboard size={32} className="text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-4">
                Amazon Seller Analytics Dashboard
              </h2>
              <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
                Connect your Amazon Seller Central account to unlock AI-powered insights, 
                real-time KPIs, and actionable recommendations to grow your business.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-8 py-3 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                >
                  Get Started Free
                </button>
                <button
                  onClick={handleGoogleLogin}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Amazon Connection Status */}
              <div className="mb-8">
                <ConnectionStatus
                  status={amazonStatus}
                  onConnect={connectAmazon}
                  onDisconnect={disconnectAmazon}
                  redirectUri={amazonStatus?.redirect_uri}
                />
              </div>
              
              {/* AI Insights */}
              <AIInsightsPanel
                insights={insights}
                loading={insightsLoading}
                onRefresh={fetchInsights}
              />
              
              {/* KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <KPICard
                  title="Total Sales"
                  value={k.total_sales || 0}
                  prefix="$"
                  icon={DollarSign}
                  color="bg-emerald-500"
                />
                <KPICard
                  title="Sessions"
                  value={k.total_sessions || 0}
                  icon={Eye}
                  color="bg-cyan-500"
                />
                <KPICard
                  title="Conversion Rate"
                  value={k.avg_conversion_rate || 0}
                  suffix="%"
                  icon={Target}
                  color="bg-violet-500"
                />
                <KPICard
                  title="Buy Box %"
                  value={k.avg_buy_box_percentage || 0}
                  suffix="%"
                  icon={Package}
                  color="bg-amber-500"
                />
              </div>
              
              {/* Second Row KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <KPICard
                  title="PPC Spend"
                  value={k.total_ppc_spend || 0}
                  prefix="$"
                  icon={BarChart3}
                  color="bg-rose-500"
                />
                <KPICard
                  title="ACOS"
                  value={k.avg_acos || 0}
                  suffix="%"
                  icon={TrendingUp}
                  color="bg-orange-500"
                />
                <KPICard
                  title="TACOS"
                  value={k.avg_tacos || 0}
                  suffix="%"
                  icon={ShoppingCart}
                  color="bg-pink-500"
                />
                <KPICard
                  title="ROAS"
                  value={k.avg_roas || 0}
                  suffix="x"
                  icon={Zap}
                  color="bg-sky-500"
                />
              </div>
              
              {/* Financial Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] mb-4">Financial Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-zinc-500 text-xs uppercase mb-1">Revenue</p>
                    <p className="text-xl font-bold text-white">${(k.total_revenue || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-zinc-500 text-xs uppercase mb-1">Total Fees</p>
                    <p className="text-xl font-bold text-rose-400">${(k.total_fees || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-zinc-500 text-xs uppercase mb-1">Refunds</p>
                    <p className="text-xl font-bold text-amber-400">${(k.total_refunds || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-zinc-500 text-xs uppercase mb-1">Refund Rate</p>
                    <p className="text-xl font-bold text-white">{k.refund_rate || 0}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <p className="text-emerald-400 text-xs uppercase mb-1">Net Profit</p>
                    <p className="text-xl font-bold text-emerald-400">${(k.net_profit || 0).toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
      <AuthModal />
    </div>
  );
};

export default DashboardPage;

/**
 * TalentOS Job Discovery Page
 * Search and discover ad-tech jobs using Adzuna API
 * Route: /talentos/jobs (or /jobs for talentos.adsgupta.com)
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, DollarSign, ExternalLink, Bookmark, BookmarkCheck,
  Filter, Briefcase, Building2, Clock, Sparkles, Bot, Loader2,
  ChevronDown, X, Target, CheckCircle2
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Job Card Component
const JobCard = ({ job, onSave, isSaved }) => {
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not disclosed';
    const formatNum = (n) => {
      if (n >= 100000) return `${(n/100000).toFixed(1)}L`;
      if (n >= 1000) return `${(n/1000).toFixed(0)}K`;
      return n?.toLocaleString();
    };
    if (min && max && min !== max) {
      return `$${formatNum(min)} - $${formatNum(max)}`;
    }
    return `$${formatNum(min || max)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {job.is_adtech && (
              <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-400">
                Ad-Tech
              </span>
            )}
            <span className="text-zinc-500 text-xs">{new Date(job.created).toLocaleDateString()}</span>
          </div>
          
          <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
            {job.title}
          </h3>
          
          <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
            <span className="flex items-center gap-1">
              <Building2 size={14} />
              {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {job.location}
            </span>
          </div>
          
          <p className="text-zinc-500 text-sm mt-3 line-clamp-2">
            {job.description}
          </p>
          
          {/* Match Keywords */}
          {job.match_keywords?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {job.match_keywords.slice(0, 5).map((kw, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-xs bg-white/5 text-zinc-400">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => onSave(job)}
            className={`p-2 rounded-lg transition-all ${
              isSaved
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
          
          <span className="text-emerald-400 text-sm font-medium whitespace-nowrap">
            {formatSalary(job.salary_min, job.salary_max)}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 rounded-lg bg-white/5 text-white text-sm font-medium text-center hover:bg-white/10 transition-all flex items-center justify-center gap-2"
        >
          <ExternalLink size={14} />
          View Job
        </a>
        <Link
          to="/talentos/workspace"
          state={{ jdUrl: job.url, jdText: job.description }}
          className="flex-1 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium text-center hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
        >
          Analyze Fit
        </Link>
      </div>
    </motion.div>
  );
};

const TalentOSJobs = () => {
  const [searchQuery, setSearchQuery] = useState('programmatic advertising');
  const [location, setLocation] = useState('us');
  const [adtechOnly, setAdtechOnly] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [config, setConfig] = useState(null);

  // Load config
  useEffect(() => {
    fetch(`${API_URL}/api/jobs/config`)
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(console.error);
  }, []);

  // Initial search
  useEffect(() => {
    searchJobs();
  }, []);

  const searchJobs = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/jobs/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: searchQuery,
          location: location,
          adtech_only: adtechOnly,
          results_per_page: 20
        })
      });
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setJobs(data);
      
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveJob = (job) => {
    if (savedJobs.some(j => j.job_id === job.job_id)) {
      setSavedJobs(prev => prev.filter(j => j.job_id !== job.job_id));
    } else {
      setSavedJobs(prev => [...prev, job]);
    }
  };

  const locations = [
    { value: 'us', label: 'United States' },
    { value: 'in', label: 'India' },
    { value: 'gb', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5 backdrop-blur-xl bg-black/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/talentos" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-bold font-['Space_Grotesk']">TalentOS</span>
              <span className="text-xs text-zinc-500 block">Job Discovery</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link to="/talentos/workspace" className="text-zinc-400 hover:text-white text-sm transition-colors">
              Workspace
            </Link>
            <Link to="/talentos/interview" className="text-zinc-400 hover:text-white text-sm transition-colors">
              Interview
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
            <Sparkles size={14} className="text-cyan-400" />
            <span className="text-zinc-400 text-sm">
              {config?.adzuna_enabled ? 'Powered by Adzuna API' : 'Demo Mode'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-['Space_Grotesk'] mb-2">
            Discover Ad-Tech Jobs
          </h1>
          <p className="text-zinc-400">
            Find programmatic, DSP, SSP, and ad operations roles
          </p>
        </motion.div>
        
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchJobs()}
                placeholder="Search jobs (e.g., programmatic, DSP, header bidding)"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-all"
                data-testid="job-search-input"
              />
            </div>
            
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
            >
              {locations.map(loc => (
                <option key={loc.value} value={loc.value} className="bg-zinc-900">
                  {loc.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${
                showFilters || adtechOnly
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
              }`}
            >
              <Filter size={18} />
              Filters
            </button>
            
            <button
              onClick={searchJobs}
              disabled={isLoading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50 flex items-center gap-2"
              data-testid="search-jobs-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Search
                </>
              )}
            </button>
          </div>
          
          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adtechOnly}
                      onChange={(e) => setAdtechOnly(e.target.checked)}
                      className="w-4 h-4 rounded bg-white/10 border-white/20 text-cyan-500 focus:ring-cyan-500/20"
                    />
                    <span className="text-zinc-300 text-sm">Ad-Tech roles only</span>
                  </label>
                  
                  <div className="flex items-center gap-2 text-zinc-500 text-sm">
                    <Target size={14} />
                    Keywords: {config?.adtech_keywords?.slice(0, 5).join(', ')}...
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Jobs List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-400 text-sm">
                {isLoading ? 'Searching...' : `${jobs.length} jobs found`}
              </p>
              
              {savedJobs.length > 0 && (
                <span className="text-emerald-400 text-sm flex items-center gap-1">
                  <BookmarkCheck size={14} />
                  {savedJobs.length} saved
                </span>
              )}
            </div>
            
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 mb-4">
                {error}
              </div>
            )}
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="p-5 rounded-xl bg-white/5 animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-20 mb-3" />
                    <div className="h-6 bg-white/10 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-white/10 rounded w-1/2 mb-4" />
                    <div className="h-16 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job, i) => (
                  <JobCard
                    key={job.job_id || i}
                    job={job}
                    onSave={handleSaveJob}
                    isSaved={savedJobs.some(j => j.job_id === job.job_id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Briefcase size={48} className="mx-auto text-zinc-600 mb-4" />
                <p className="text-zinc-400">No jobs found. Try different keywords or location.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/5"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/talentos/workspace"
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-center"
            >
              <Target size={24} className="mx-auto text-cyan-400 mb-2" />
              <p className="text-white font-medium text-sm">Analyze Your Fit</p>
              <p className="text-zinc-500 text-xs">Upload resume & JD</p>
            </Link>
            
            <Link
              to="/talentos/interview"
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-center"
            >
              <Bot size={24} className="mx-auto text-purple-400 mb-2" />
              <p className="text-white font-medium text-sm">Practice Interview</p>
              <p className="text-zinc-500 text-xs">Mock interview room</p>
            </Link>
            
            <div className="p-4 rounded-xl bg-white/5 text-center opacity-60">
              <Sparkles size={24} className="mx-auto text-amber-400 mb-2" />
              <p className="text-white font-medium text-sm">AI Recommendations</p>
              <p className="text-zinc-500 text-xs">Coming soon</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TalentOSJobs;

"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Bot, Bookmark, BookmarkCheck, Briefcase, Building2, ExternalLink, Loader2, MapPin, Search, Sparkles } from "lucide-react";

type Job = {
  job_id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_min: number | null;
  salary_max: number | null;
  url: string;
  created: string;
  match_score?: number | null;
  match_reason?: string | null;
};

type Tab = "search" | "recommended" | "saved";

function JobCard({ job, onSave, isSaved, onRemoveSaved }: {
  job: Job;
  onSave: (j: Job) => void;
  isSaved: boolean;
  onRemoveSaved?: (id: string) => void;
}) {
  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Not disclosed";
    const formatNum = (n: number) => {
      if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
      if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
      return n?.toLocaleString();
    };
    if (min && max && min !== max) {
      return `$${formatNum(min)} - $${formatNum(max)}`;
    }
    return `$${formatNum(min || max || 0)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-zinc-500 text-xs">{new Date(job.created).toLocaleDateString()}</span>
            {job.match_score !== undefined && job.match_score !== null ? (
              <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400">
                Match {Math.round(job.match_score)}%
              </span>
            ) : null}
          </div>
          <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">{job.title}</h3>
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
          <p className="text-zinc-500 text-sm mt-3 line-clamp-2">{job.description}</p>
          {job.match_reason ? <p className="text-emerald-300 text-xs mt-3">{job.match_reason}</p> : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          {onRemoveSaved && isSaved ? (
            <button
              type="button"
              onClick={() => onRemoveSaved(job.job_id)}
              className="p-2 rounded-lg transition-all bg-red-500/20 text-red-300 hover:bg-red-500/30"
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSave(job)}
              className={`p-2 rounded-lg transition-all ${
                isSaved ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
          )}
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
          href="/workspace"
          className="flex-1 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium text-center hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
        >
          Analyze Fit
        </Link>
      </div>
    </motion.div>
  );
}

export default function JobsPage() {
  const [tab, setTab] = useState<Tab>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("us");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasAdzunaKeys, setHasAdzunaKeys] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecsLoading, setIsRecsLoading] = useState(false);
  const [error, setError] = useState("");
  const [authAvailable, setAuthAvailable] = useState(true);

  useEffect(() => {
    fetch("/api/jobs/config")
      .then((res) => res.json())
      .then((data: { adzuna_enabled?: boolean }) => setHasAdzunaKeys(Boolean(data.adzuna_enabled)))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const role = new URLSearchParams(window.location.search).get("role");
    if (role) {
      setSearchQuery(role);
    } else {
      setSearchQuery("software engineer");
    }
  }, []);

  async function loadSavedJobs() {
    try {
      const res = await fetch("/api/jobs/saved");
      if (!res.ok) {
        setAuthAvailable(false);
        setSavedJobs([]);
        return;
      }
      const data = (await res.json()) as { jobs: Job[] };
      setSavedJobs(data.jobs ?? []);
      setAuthAvailable(true);
    } catch {
      setSavedJobs([]);
      setAuthAvailable(false);
    }
  }

  async function searchJobs(reset = false) {
    const targetPage = reset ? 1 : page;
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          location,
          country,
          page: targetPage,
        }),
      });
      if (!response.ok) throw new Error("Search failed");
      const data = (await response.json()) as Job[];
      const next = reset ? data : [...jobs, ...data];
      setJobs(next);
      setHasMore(data.length >= 20);
      setPage(targetPage + 1);
    } catch (err) {
      console.error(err);
      setError("Failed to search jobs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!searchQuery) return;
    void searchJobs(true);
    void loadSavedJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, location, country]);

  async function loadRecommendedJobs() {
    setIsRecsLoading(true);
    try {
      const response = await fetch("/api/jobs/recommendations");
      if (!response.ok) {
        setRecommendedJobs([]);
        return;
      }
      const data = (await response.json()) as { jobs: Job[] };
      setRecommendedJobs(data.jobs ?? []);
    } finally {
      setIsRecsLoading(false);
    }
  }

  async function handleSaveJob(job: Job) {
    try {
      const response = await fetch("/api/jobs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job }),
      });
      if (!response.ok) throw new Error("Save failed");
      await loadSavedJobs();
    } catch {
      setError("Please sign in to save jobs.");
    }
  }

  async function removeSavedJob(id: string) {
    try {
      const response = await fetch(`/api/jobs/saved/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Remove failed");
      await loadSavedJobs();
    } catch {
      setError("Failed to remove saved job.");
    }
  }

  const countries = [
    { value: "us", label: "US" },
    { value: "gb", label: "UK" },
    { value: "in", label: "India" },
    { value: "au", label: "Australia" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
    { value: "jp", label: "Japan" },
    { value: "ca", label: "Canada" },
    { value: "br", label: "Brazil" },
    { value: "sg", label: "Singapore" },
  ];

  const visibleJobs = useMemo(() => {
    if (tab === "search") return jobs;
    if (tab === "recommended") return recommendedJobs;
    return savedJobs;
  }, [tab, jobs, recommendedJobs, savedJobs]);

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
              <span className="text-xs text-zinc-500 block">Job Discovery</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/workspace" className="text-zinc-400 hover:text-white text-sm transition-colors">
              Workspace
            </Link>
            <Link href="/interview" className="text-zinc-400 hover:text-white text-sm transition-colors">
              Interview
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative max-w-6xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
            <Sparkles size={14} className="text-cyan-400" />
            <span className="text-zinc-400 text-sm">
              {hasAdzunaKeys ? "Powered by Adzuna API" : "Job search coming soon"}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-space)] mb-2">
            Discover Jobs
          </h1>
          <p className="text-zinc-400">Search, save, and get smart recommendations</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setTab("search")} className={`px-3 py-2 rounded-lg text-sm ${tab === "search" ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-zinc-400"}`}>Search</button>
            <button onClick={() => { setTab("recommended"); void loadRecommendedJobs(); }} className={`px-3 py-2 rounded-lg text-sm ${tab === "recommended" ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-zinc-400"}`}>Recommended for You</button>
            <button onClick={() => { setTab("saved"); void loadSavedJobs(); }} className={`px-3 py-2 rounded-lg text-sm ${tab === "saved" ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-zinc-400"}`}>Saved Jobs</button>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void searchJobs(true)}
                placeholder="Role or keyword"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g., London, Remote)"
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
            />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
            >
              {countries.map((loc) => (
                <option key={loc.value} value={loc.value} className="bg-zinc-900">
                  {loc.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void searchJobs(true)}
              disabled={isLoading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50 flex items-center gap-2"
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
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {error ? <div className="md:col-span-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">{error}</div> : null}
          {!hasAdzunaKeys && tab !== "saved" ? (
            <div className="md:col-span-2 text-center py-16 rounded-xl bg-white/5 border border-white/10">
              <Briefcase size={42} className="mx-auto text-zinc-600 mb-3" />
              <p className="text-zinc-300">Job search coming soon</p>
            </div>
          ) : null}
          {tab === "recommended" && isRecsLoading ? (
            <div className="md:col-span-2 flex items-center justify-center py-16 text-zinc-400">
              <Loader2 size={18} className="animate-spin mr-2" /> Loading recommendations...
            </div>
          ) : null}
          {visibleJobs.map((job, i) => (
            <JobCard
              key={`${job.job_id}-${i}`}
              job={job}
              onSave={handleSaveJob}
              isSaved={savedJobs.some((s) => s.job_id === job.job_id)}
              onRemoveSaved={tab === "saved" ? removeSavedJob : undefined}
            />
          ))}
          {!isLoading && !isRecsLoading && visibleJobs.length === 0 && (tab === "saved" ? authAvailable : hasAdzunaKeys) ? (
            <div className="md:col-span-2 text-center py-16">
              <Briefcase size={40} className="mx-auto text-zinc-600 mb-3" />
              <p className="text-zinc-400">{tab === "saved" ? "No saved jobs yet." : "No jobs found."}</p>
            </div>
          ) : null}
        </div>

        {tab === "search" && hasMore ? (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => void searchJobs(false)}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Load More"}
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}

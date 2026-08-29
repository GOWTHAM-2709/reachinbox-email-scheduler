import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Server,
  Layers,
  BarChart3
} from 'lucide-react';
import { Button } from '../components/UI';

export const Landing = () => {
  const { user } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-mesh-dark text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
      {/* Background Glow Spheres */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-blue-600/20 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[600px] right-[-100px] w-[500px] h-[400px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              ReachInbox
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#architecture" className="hover:text-blue-400 transition-colors">Architecture</a>
            <a href="#workflow" className="hover:text-blue-400 transition-colors">How It Works</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm">
                  Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <Button onClick={handleGoogleLogin} variant="glass" size="sm">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 border border-blue-500/30 text-blue-400 backdrop-blur-md mb-8 animate-in shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Distributed Email Orchestration Engine</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          High-Throughput Email Scheduling With{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Distributed Rate Limiting
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          Orchestrate cold email cadences at scale. Protect sender reputation with Redis sliding-window rate limits, BullMQ delayed queues, and instant Slack alerts.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          {user ? (
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Open Dashboard <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          ) : (
            <Button onClick={handleGoogleLogin} variant="primary" size="lg" className="w-full sm:w-auto">
              Get Started with Google <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          )}
          <a href="#features" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Explore Architecture
            </Button>
          </a>
        </div>

        {/* Live Interactive Architecture Mockup Card */}
        <div className="relative max-w-5xl mx-auto rounded-2xl glass-panel p-2 sm:p-4 shadow-2xl shadow-blue-900/30 border border-slate-700/60 animate-float">
          <div className="rounded-xl bg-slate-950/90 border border-slate-800/80 p-5 sm:p-7 text-left overflow-hidden">
            {/* Top Mockup Header Bar */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="text-xs text-slate-500 ml-2 font-mono">cluster://reachinbox-bullmq-worker</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Worker Active &bull; 5x Concurrency
                </span>
              </div>
            </div>

            {/* Architecture Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-xs text-slate-400 font-medium">Rate Limiting Window</p>
                <p className="text-xl font-bold text-white mt-1">100 / hr</p>
                <span className="text-[11px] text-blue-400 flex items-center gap-1 mt-1">
                  <Zap className="w-3 h-3" /> Redis sliding-window
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-xs text-slate-400 font-medium">Minimum Inter-Send Delay</p>
                <p className="text-xl font-bold text-white mt-1">2.0s</p>
                <span className="text-[11px] text-indigo-400 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> Anti-burst protection
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-xs text-slate-400 font-medium">Slack Alert Integration</p>
                <p className="text-xl font-bold text-white mt-1">Live OAuth</p>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> Deduplicated alerts
                </span>
              </div>
            </div>

            {/* Mock Queue Items Preview */}
            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-slate-400">JOB #1042</span>
                  <span className="text-white truncate">campaign_dispatch &bull; user@enterprise.io</span>
                </div>
                <span className="text-emerald-400 flex-shrink-0">SENT (200 OK)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                  <span className="text-slate-400">JOB #1043</span>
                  <span className="text-white truncate">campaign_dispatch &bull; leads@venture.co</span>
                </div>
                <span className="text-blue-400 flex-shrink-0">PROCESSING</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="text-slate-400">JOB #1044</span>
                  <span className="text-white truncate">campaign_dispatch &bull; growth@tech.inc</span>
                </div>
                <span className="text-amber-400 flex-shrink-0">SCHEDULED (+2s delay)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold text-blue-400 tracking-wider uppercase mb-2">
            Engineered for Reliability
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Everything You Need for Enterprise Outbound Automation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl glass-card glass-card-hover">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">BullMQ Concurrency Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Atomic state transitions (`scheduled` $\rightarrow$ `processing` $\rightarrow$ `sent`) ensure zero duplicate emails even under high worker concurrency.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl glass-card glass-card-hover">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-5">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Sliding-Window Rate Limiting</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Enforce hourly email caps per sender. When limits are reached, excess jobs are seamlessly rescheduled to the next hour window.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl glass-card glass-card-hover">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-5">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-Time Slack Alerts</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Full OAuth v2 integration connects your team workspace. Rate-limit triggers dispatch rich formatted alerts with automatic 1-hour deduplication.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl glass-card glass-card-hover">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mb-5">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Elasticsearch & SQL Search</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Full-text keyword querying across recipient addresses, email subject lines, and body content with sub-millisecond search performance.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl glass-card glass-card-hover">
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center mb-5">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Bulk CSV Ingestion</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Drag-and-drop CSV recipient lists with automatic duplicate removal, format validation, and batch job enrollment.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl glass-card glass-card-hover">
            <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">OAuth 2.0 & Session Security</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Google OAuth authentication backed by encrypted HTTP-only session cookies with strict cross-domain reverse proxy support.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works / Workflow Section */}
      <section id="workflow" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-semibold text-blue-400 tracking-wider uppercase mb-2">
            Execution Pipeline
          </h2>
          <p className="text-3xl font-bold text-white tracking-tight">
            How Emails Are Scheduled & Delivered
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-left">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm mb-4">
              1
            </span>
            <h3 className="text-base font-semibold text-white mb-2">Upload & Configure</h3>
            <p className="text-sm text-slate-400">
              Provide recipient CSV, write subject & body, and set hourly sending rate and inter-email delays.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-left">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm mb-4">
              2
            </span>
            <h3 className="text-base font-semibold text-white mb-2">Queue & Throttle</h3>
            <p className="text-sm text-slate-400">
              BullMQ delayed jobs enqueue in Redis. Sliding-window counters enforce rate caps and prevent ESP blocks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-left">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm mb-4">
              3
            </span>
            <h3 className="text-base font-semibold text-white mb-2">Dispatch & Alert</h3>
            <p className="text-sm text-slate-400">
              Emails dispatch via SMTP, live delivery status logs to PostgreSQL/Elasticsearch, and Slack notifies on rate limit triggers.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="rounded-3xl p-8 sm:p-12 glass-panel border border-blue-500/20 bg-gradient-to-b from-blue-950/40 to-slate-950/80 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Automate Your Cold Email Outbound?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8">
            Experience reliable, rate-limited email delivery with production-grade monitoring.
          </p>
          <Button onClick={handleGoogleLogin} variant="primary" size="lg">
            Sign In with Google <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium text-slate-400">
            <Mail className="w-4 h-4 text-blue-500" />
            <span>ReachInbox Email Scheduler &bull; Production Platform</span>
          </div>
          <p className="text-slate-500">
            Built with React, TypeScript, Node.js, BullMQ, Redis, PostgreSQL & Elasticsearch.
          </p>
        </div>
      </footer>
    </div>
  );
};

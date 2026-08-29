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
  Layers,
  BarChart3
} from 'lucide-react';
import { Button } from '../components/UI';
import { ThemeToggle } from '../components/ThemeToggle';

export const Landing = () => {
  const { user } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white relative overflow-x-hidden transition-colors duration-200">
      {/* Background Ambient Glow Accents */}
      <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-400/15 dark:bg-blue-600/20 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[600px] right-[-100px] w-[500px] h-[400px] bg-indigo-400/10 dark:bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 flex-shrink-0">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
              ReachInbox
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#architecture" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Architecture</a>
            <a href="#workflow" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How It Works</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <ThemeToggle />
            {user ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm">
                  Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <Button onClick={handleGoogleLogin} variant="primary" size="sm">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-12 sm:pt-16 sm:pb-14 md:pt-24 md:pb-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 mb-6 sm:mb-8 animate-in shadow-sm max-w-full">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="truncate">Distributed Email Orchestration Engine</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15] sm:leading-[1.1] mb-4 sm:mb-6">
          High-Throughput Email Scheduling With{' '}
          <span className="text-blue-600 dark:text-blue-400">
            Distributed Rate Limiting
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-sm sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 font-normal leading-relaxed">
          Orchestrate cold email cadences at scale. Protect sender reputation with Redis sliding-window rate limits, BullMQ delayed queues, and instant Slack alerts.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 max-w-md sm:max-w-none mx-auto">
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
              Explore Features
            </Button>
          </a>
        </div>

        {/* Live Interactive Architecture Mockup Card */}
        <div id="architecture" className="relative max-w-5xl mx-auto rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 p-3 sm:p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-float text-left overflow-hidden">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 sm:pb-4 mb-4 sm:mb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500 flex-shrink-0"></span>
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500 flex-shrink-0"></span>
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 flex-shrink-0"></span>
              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 ml-1.5 font-mono truncate">cluster://reachinbox-bullmq-worker</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-semibold">
                Worker Active &bull; 5x Concurrency
              </span>
            </div>
          </div>

          {/* Architecture Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Rate Limiting Window</p>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">100 / hr</p>
              <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1 font-medium">
                <Zap className="w-3.5 h-3.5" /> Redis sliding-window
              </span>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Minimum Inter-Send Delay</p>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">2.0s</p>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-1 font-medium">
                <Clock className="w-3.5 h-3.5" /> Anti-burst protection
              </span>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Slack Alert Integration</p>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">Live OAuth</p>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Deduplicated alerts
              </span>
            </div>
          </div>

          {/* Mock Queue Items Preview */}
          <div className="space-y-2 font-mono text-xs">
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                <span className="text-slate-500 font-semibold flex-shrink-0">#1042</span>
                <span className="text-slate-900 dark:text-white font-medium truncate min-w-0">campaign &bull; user@enterprise.io</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex-shrink-0 text-[11px] sm:text-xs">SENT (200)</span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping flex-shrink-0"></span>
                <span className="text-slate-500 font-semibold flex-shrink-0">#1043</span>
                <span className="text-slate-900 dark:text-white font-medium truncate min-w-0">campaign &bull; leads@venture.co</span>
              </div>
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0 text-[11px] sm:text-xs">PROCESS</span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                <span className="text-slate-500 font-semibold flex-shrink-0">#1044</span>
                <span className="text-slate-900 dark:text-white font-medium truncate min-w-0">campaign &bull; growth@tech.inc</span>
              </div>
              <span className="text-amber-600 dark:text-amber-400 font-bold flex-shrink-0 text-[11px] sm:text-xs">DELAY (+2s)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid Section */}
      <section id="features" className="py-12 sm:py-16 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-2">
            Engineered for Reliability
          </h2>
          <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Everything You Need for Enterprise Outbound Automation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Feature 1 */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center mb-4 sm:mb-5">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">BullMQ Concurrency Engine</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Atomic state transitions (`scheduled` $\rightarrow$ `processing` $\rightarrow$ `sent`) ensure zero duplicate emails even under high worker concurrency.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center mb-4 sm:mb-5">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">Sliding-Window Rate Limiting</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Enforce hourly email caps per sender. When limits are reached, excess jobs are seamlessly rescheduled to the next hour window.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center mb-4 sm:mb-5">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">Real-Time Slack Alerts</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Full OAuth v2 integration connects your team workspace. Rate-limit triggers dispatch rich alerts with automatic 1-hour deduplication.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-cyan-50 dark:bg-cyan-600/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center mb-4 sm:mb-5">
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">Elasticsearch & SQL Search</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Full-text keyword querying across recipient addresses, email subject lines, and body content with sub-millisecond search performance.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-violet-50 dark:bg-violet-600/20 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/30 flex items-center justify-center mb-4 sm:mb-5">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">Bulk CSV Ingestion</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Drag-and-drop CSV recipient lists with automatic duplicate removal, format validation, and batch job enrollment.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-rose-50 dark:bg-rose-600/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center mb-4 sm:mb-5">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">OAuth 2.0 & Session Security</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Google OAuth authentication backed by encrypted HTTP-only session cookies with strict cross-domain reverse proxy support.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="workflow" className="py-12 sm:py-16 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-2">
            Execution Pipeline
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How Emails Are Scheduled & Delivered
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm mb-4">
              1
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Upload & Configure</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Provide recipient CSV, write subject & body, and set hourly sending rate and inter-email delays.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm mb-4">
              2
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Queue & Throttle</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              BullMQ delayed jobs enqueue in Redis. Sliding-window counters enforce rate caps and prevent ESP blocks.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm mb-4">
              3
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Dispatch & Alert</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Emails dispatch via SMTP, live delivery status logs to database, and Slack notifies on rate limit triggers.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 sm:py-16 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-12 bg-blue-600 text-white shadow-xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-3 sm:mb-4">
            Ready to Automate Your Cold Email Outbound?
          </h2>
          <p className="text-xs sm:text-base text-blue-100 max-w-xl mx-auto mb-6 sm:mb-8 font-normal">
            Experience reliable, rate-limited email delivery with production-grade monitoring.
          </p>
          <Button onClick={handleGoogleLogin} variant="secondary" size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 border-none font-bold">
            Sign In with Google <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 sm:py-8 px-3 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-400">
            <Mail className="w-4 h-4 text-blue-600" />
            <span>ReachInbox Email Scheduler &bull; Production Platform</span>
          </div>
          <p className="text-slate-500 text-[11px] sm:text-xs">
            Built with React, TypeScript, Node.js, BullMQ, Redis, PostgreSQL & Elasticsearch.
          </p>
        </div>
      </footer>
    </div>
  );
};

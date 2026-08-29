import { useState } from "react";
import { useAuth } from '../../context/AuthContext';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LogOut, 
  Plus, 
  Search, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  Menu, 
  X,
} from 'lucide-react';
import { Loading, Button } from '../../components/UI';
import { ThemeToggle } from '../../components/ThemeToggle';
import { ComposeModal } from './ComposeModal';
import { apiClient } from '../../api/client';

export const DashboardLayout = () => {
  const { user, loading, logout, checkAuth } = useAuth();
  const location = useLocation();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [disconnectingSlack, setDisconnectingSlack] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  if (loading) return <Loading text="Loading dashboard..." />;
  if (!user) return <Navigate to="/login" />;

  const handleSlackConnect = () => {
    window.location.href = `${BACKEND_URL}/api/slack/connect`;
  };

  const handleSlackDisconnect = async () => {
    try {
      setDisconnectingSlack(true);
      await apiClient.delete('/api/slack/disconnect');
      await checkAuth(); // Refresh user state
    } catch (error) {
      console.error('Failed to disconnect slack');
    } finally {
      setDisconnectingSlack(false);
    }
  };

  const navigationItems = [
    { label: 'Scheduled Emails', path: '/dashboard', icon: Clock },
    { label: 'Sent History', path: '/dashboard/sent', icon: Send },
    { label: 'Full-Text Search', path: '/dashboard/search', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-mesh-canvas text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white transition-colors duration-200 overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform flex-shrink-0">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                    ReachInbox
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium leading-tight truncate">
                    Email Scheduler
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Center Navigation Pills */}
            <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Controls */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Theme Toggle Button */}
              <ThemeToggle />

              {/* Slack Status / Action */}
              {user.slackConnected ? (
                <div className="flex items-center gap-2 p-1 pl-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Slack Connected
                  </span>
                  <button
                    onClick={handleSlackDisconnect}
                    disabled={disconnectingSlack}
                    className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-2 py-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    {disconnectingSlack ? '...' : 'Disconnect'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSlackConnect}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700/80 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
                >
                  <img
                    src="https://www.svgrepo.com/show/475682/slack-color.svg"
                    alt="Slack"
                    className="h-3.5 w-3.5"
                  />
                  <span>Connect Slack</span>
                </button>
              )}

              {/* User Profile Chip */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[130px]">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Log out"
                className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Header Controls */}
            <div className="sm:hidden flex items-center gap-1.5">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden p-4 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl space-y-3 animate-in shadow-xl">
            {/* User Profile in Mobile */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 min-w-0">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-600/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="truncate min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            {/* Navigation items in Mobile */}
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium ${
                      isActive ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Slack in Mobile */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              {user.slackConnected ? (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Slack Connected
                  </span>
                  <button
                    onClick={handleSlackDisconnect}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSlackConnect}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
                >
                  <img src="https://www.svgrepo.com/show/475682/slack-color.svg" className="w-4 h-4" alt="Slack" />
                  Connect Slack
                </button>
              )}
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-xs font-medium"
            >
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page Header Bar with Action CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Email Orchestration
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                BullMQ Ready
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Automated cadence scheduling with Redis rate limiting & live delivery tracking.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              onClick={() => setIsComposeOpen(true)}
              variant="primary"
              size="md"
              className="w-full sm:w-auto shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1" /> Compose Campaign
            </Button>
          </div>
        </div>

        {/* Dashboard Content Container */}
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden backdrop-blur-sm">
          <Outlet />
        </div>
      </main>

      {/* Compose Campaign Modal */}
      {isComposeOpen && <ComposeModal onClose={() => setIsComposeOpen(false)} />}
    </div>
  );
};

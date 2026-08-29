import { useState } from "react";
import { useAuth } from '../../context/AuthContext';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { LogOut, Plus, Search, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { Loading, Button } from '../../components/UI';
import { ComposeModal } from './ComposeModal';
import { apiClient } from '../../api/client';

export const DashboardLayout = () => {
  const { user, loading, logout, checkAuth } = useAuth();
  const location = useLocation();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [disconnectingSlack, setDisconnectingSlack] = useState(false);
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900">
                ReachInbox
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Slack Status / Action */}
              {user.slackConnected ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Slack Connected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSlackDisconnect}
                    isLoading={disconnectingSlack}
                    className="text-xs text-slate-500 hover:text-rose-600"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <button
                  onClick={handleSlackConnect}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-colors"
                >
                  <img
                    src="https://www.svgrepo.com/show/475682/slack-color.svg"
                    alt="Slack"
                    className="h-3.5 w-3.5"
                  />
                  <span>Connect Slack</span>
                </button>
              )}

              {/* User Profile */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs border border-blue-200">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-slate-900 leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-tight truncate max-w-[140px]">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Log out"
                className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Email Campaigns
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Schedule, monitor, and manage your outbound email delivery.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsComposeOpen(true)}
              variant="primary"
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-1" /> Compose Campaign
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 flex items-center justify-between mb-6">
          <nav className="flex space-x-8 -mb-px">
            <Link
              to="/dashboard"
              className={`inline-flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                location.pathname === '/dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              Scheduled Emails
            </Link>
            <Link
              to="/dashboard/sent"
              className={`inline-flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                location.pathname === '/dashboard/sent'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Send className="w-4 h-4" />
              Sent Emails
            </Link>
            <Link
              to="/dashboard/search"
              className={`inline-flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                location.pathname === '/dashboard/search'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Search className="w-4 h-4" />
              Search
            </Link>
          </nav>
        </div>

        {/* Table Container Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
          <Outlet />
        </div>
      </main>

      {/* Compose Campaign Modal */}
      {isComposeOpen && <ComposeModal onClose={() => setIsComposeOpen(false)} />}
    </div>
  );
};

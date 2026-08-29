import { useState } from "react";
import { useAuth } from '../../context/AuthContext';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { LogOut, Plus, Search } from 'lucide-react';
import { Loading, Button } from '../../components/UI';
import { ComposeModal } from './ComposeModal';
import { apiClient } from '../../api/client';

export const DashboardLayout = () => {
  const { user, loading, logout, checkAuth } = useAuth();
  const location = useLocation();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;

  const handleSlackConnect = () => {
    window.location.href = `${BACKEND_URL}/api/slack/connect`;
  };

  const handleSlackDisconnect = async () => {
    try {
      await apiClient.delete('/api/slack/disconnect');
      await checkAuth(); // Refresh user state
    } catch (error) {
      console.error('Failed to disconnect slack');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">ReachInbox</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 pr-4 border-r border-gray-200">
                {user.avatar && (
                  <img src={user.avatar} alt="Avatar" className="h-8 w-8 rounded-full" />
                )}
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-gray-500 text-xs">{user.email}</p>
                </div>
              </div>
              
              {user.slackConnected ? (
                <Button variant="secondary" onClick={handleSlackDisconnect} className="text-sm py-1.5">
                  Disconnect Slack
                </Button>
              ) : (
                <Button variant="secondary" onClick={handleSlackConnect} className="text-sm py-1.5 flex items-center">
                  <img src="https://www.svgrepo.com/show/475682/slack-color.svg" alt="Slack" className="h-4 w-4 mr-2" />
                  Connect Slack
                </Button>
              )}
              
              <button onClick={logout} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-6 border-b border-gray-200 w-full relative">
            <Link 
              to="/dashboard" 
              className={`pb-4 px-1 text-sm font-medium ${location.pathname === '/dashboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Scheduled Emails
            </Link>
            <Link 
              to="/dashboard/sent" 
              className={`pb-4 px-1 text-sm font-medium ${location.pathname === '/dashboard/sent' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sent Emails
            </Link>
            
            <div className="ml-auto pb-2 flex space-x-3">
              <Link to="/dashboard/search" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                 <Search className="h-5 w-5" />
              </Link>
              <Button onClick={() => setIsComposeOpen(true)} className="py-2">
                <Plus className="h-4 w-4 mr-1" /> Compose
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
           <Outlet />
        </div>
      </main>

      {isComposeOpen && <ComposeModal onClose={() => setIsComposeOpen(false)} />}
    </div>
  );
};

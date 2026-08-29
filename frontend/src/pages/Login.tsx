import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Loading } from '../components/UI';
import { Mail, ShieldCheck, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const Login = () => {
  const { user, loading } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  if (loading) return <Loading text="Authenticating..." />;
  if (user) return <Navigate to="/dashboard" />;

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Ambient Pulsing Glow Spheres */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/25 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/20 blur-[130px] rounded-full pointer-events-none -z-10 animate-pulse-slow" />

      {/* Top Controls Bar */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Landing Page</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Mark */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-5 p-0.5 animate-in">
          <div className="w-full h-full rounded-2xl flex items-center justify-center">
            <Mail className="w-7 h-7 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Welcome to ReachInbox
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto font-normal">
          Intelligent, rate-limited email scheduling & delivery platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Auth Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 dark:border-slate-800 animate-in">
          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-between px-5 py-3.5 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-sm bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold transition-all duration-200 active:scale-[0.98] group"
            >
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </button>

            <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="font-medium">OAuth 2.0 Secure</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="font-medium">BullMQ Engine</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 font-medium">
          ReachInbox Email Scheduler &bull; Enterprise Outbound Platform
        </p>
      </div>
    </div>
  );
};

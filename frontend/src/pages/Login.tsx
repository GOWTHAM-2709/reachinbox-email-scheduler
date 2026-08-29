import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loading } from '../components/UI';

export const Login = () => {
  const { user, loading } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  if (loading) return <Loading />;
  if (user) return <Navigate to="/dashboard" />;

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ReachInbox
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Email Scheduling & Automation
          </p>
        </div>
        
        <div className="mt-8">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <img 
              className="h-5 w-5 mr-2" 
              src="https://www.svgrepo.com/show/475656/google-color.svg" 
              alt="Google" 
            />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

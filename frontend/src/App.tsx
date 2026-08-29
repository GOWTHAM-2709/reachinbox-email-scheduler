import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { DashboardLayout } from './pages/Dashboard/Layout';
import { ScheduledEmails } from './pages/Dashboard/Scheduled';
import { SentEmails } from './pages/Dashboard/Sent';
import { Search } from './pages/Dashboard/Search';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<ScheduledEmails />} />
            <Route path="sent" element={<SentEmails />} />
            <Route path="search" element={<Search />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

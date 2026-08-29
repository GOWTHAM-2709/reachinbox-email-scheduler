import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<ScheduledEmails />} />
            <Route path="sent" element={<SentEmails />} />
            <Route path="search" element={<Search />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;


import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSucces';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/test-payment" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/profile" element={<ProfilePage />} />

      </Routes>
    </Router>
  );
}

export default App;

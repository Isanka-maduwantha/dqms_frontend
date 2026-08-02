import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Notice ../ to go up out of app/ into components/ and pages/
import Navbar from './components/Navbar';
import LoginPage from './pages/auth/login/LoginPage';
import RegisterPage from './pages/auth/register/RegisterPage';
import { ReceptionistDashboardPage } from './pages/receptionist/ReceptionistDashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/receptionist" element={<ReceptionistDashboardPage />} />
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
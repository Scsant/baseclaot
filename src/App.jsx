import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// App pages
import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import Balanca from '@/pages/Balanca';
import Central from '@/pages/Central';
import Dashboard from '@/pages/Dashboard';
import PainelMotoristas from '@/pages/PainelMotoristas';
import Auditoria from '@/pages/Auditoria';
import CaminhoesDisponiveis from '@/pages/CaminhoesDisponiveis';
import Simulador from '@/pages/Simulador';
import MotorSimulacao from '@/pages/MotorSimulacao';
import TrocaTurno from '@/pages/TrocaTurno.jsx';
import ManutencaoCreare from '@/pages/ManutencaoCreare';
import PainelManutencao from '@/pages/PainelManutencao';
import InfCampo from '@/pages/InfCampo';
import CadastroVeiculos from '@/pages/CadastroVeiculos';
import AgenteTurnoManager from '@/pages/AgenteturnoManager';
import TPA from '@/pages/TPA';
import Distribuicao from '@/pages/Distribuicao';
import NotificacaoManutencaoToast from '@/components/manutencao/NotificacaoManutencaoToast';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Public panels - no auth required */}
      <Route path="/painel" element={<PainelMotoristas />} />
      <Route path="/manutencao-painel" element={<PainelManutencao />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/balanca" element={<Balanca />} />
          <Route path="/central" element={<Central />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auditoria" element={<Auditoria />} />
          <Route path="/caminhoes-disponiveis" element={<CaminhoesDisponiveis />} />
          <Route path="/simulador" element={<Simulador />} />
          <Route path="/motor-simulacao" element={<MotorSimulacao />} />
          <Route path="/troca-turno" element={<TrocaTurno />} />
          <Route path="/manutencao-creare" element={<ManutencaoCreare />} />
          <Route path="/inf-campo" element={<InfCampo />} />
          <Route path="/cadastro-veiculos" element={<CadastroVeiculos />} />
          <Route path="/agente-turno" element={<AgenteTurnoManager />} />
          <Route path="/tpa" element={<TPA />} />
          <Route path="/distribuicao" element={<Distribuicao />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};



function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <NotificacaoManutencaoToast />
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
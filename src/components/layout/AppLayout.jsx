import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import {
  Scale,
  Monitor,
  BarChart3,
  LogOut,
  Truck,
  Menu,
  X,
  ClipboardList,
  Home,
  CheckCircle2,
  ArrowLeftRight,
  Wrench,
  Bot,
  Activity,
  MapPinned,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = {
  operador: [
    { label: "Início", path: "/", icon: Home },
    { label: "Balança", path: "/balanca", icon: Scale },
    { label: "Central", path: "/central", icon: Monitor },
    { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
    { label: "Caminhões", path: "/caminhoes-disponiveis", icon: CheckCircle2 },
    { label: "Troca Turno", path: "/troca-turno", icon: ArrowLeftRight },
    { label: "Agente Turno", path: "/agente-turno", icon: Bot },
    { label: "TPA", path: "/tpa", icon: Activity },
    { label: "Distribuição", path: "/distribuicao", icon: MapPinned },
    { label: "Manutenção", path: "/manutencao-creare", icon: Wrench },
  ],
  central: [
    { label: "Início", path: "/", icon: Home },
    { label: "Central", path: "/central", icon: Monitor },
    { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
    { label: "Caminhões", path: "/caminhoes-disponiveis", icon: CheckCircle2 },
    { label: "Troca Turno", path: "/troca-turno", icon: ArrowLeftRight },
    { label: "Agente Turno", path: "/agente-turno", icon: Bot },
    { label: "TPA", path: "/tpa", icon: Activity },
    { label: "Distribuição", path: "/distribuicao", icon: MapPinned },
    { label: "Manutenção", path: "/manutencao-creare", icon: Wrench },
  ],
  admin: [
    { label: "Início", path: "/", icon: Home },
    { label: "Balança", path: "/balanca", icon: Scale },
    { label: "Central", path: "/central", icon: Monitor },
    { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
    { label: "Auditoria", path: "/auditoria", icon: ClipboardList },
    { label: "Caminhões", path: "/caminhoes-disponiveis", icon: CheckCircle2 },
    { label: "Troca Turno", path: "/troca-turno", icon: ArrowLeftRight },
    { label: "Agente Turno", path: "/agente-turno", icon: Bot },
    { label: "TPA", path: "/tpa", icon: Activity },
    { label: "Distribuição", path: "/distribuicao", icon: MapPinned },
    { label: "Manutenção", path: "/manutencao-creare", icon: Wrench },
  ],
};

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = user?.role || "operador";
  const items = navItems[role] || navItems.operador;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-[120rem] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold tracking-tight text-foreground leading-none">Sistema OT</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Liberação de Transporte</p>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-medium text-foreground">{user?.full_name}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => base44.auth.logout()}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-2 space-y-1">
            {items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      <main className="max-w-[120rem] mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
import "./App.css";
import type { ReactNode } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";

import AppRoutes from "./app/routes/AppRoutes";
import NavBar from "./components/Navbar";
import FooterBar from "./components/FooterBar";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./features/auth/AuthContext";

// Staff/admin dashboards render their own DashboardShell chrome
// (sidebar + topbar), so the public marketing Navbar/Footer are
// hidden on those routes.
const DASHBOARD_PREFIXES = ["/receptionist", "/dentist", "/admin/dashboard", "/admin/inventory", "/admin/reports"];

function Chrome({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isDashboard = DASHBOARD_PREFIXES.some((prefix) => location.pathname.startsWith(prefix));

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <NavBar />
      {children}
      <FooterBar />
    </>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  // Remounting on path change means navigating away from a crashed
  // page clears the error automatically, instead of it sticking around.
  return <ErrorBoundary key={location.pathname}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <main className="main-content min-h-screen relative flex flex-col justify-between">
          <Chrome>
            <RoutedErrorBoundary>
              <AppRoutes />
            </RoutedErrorBoundary>
          </Chrome>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

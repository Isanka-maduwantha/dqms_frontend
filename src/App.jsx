import "./App.css";
import { BrowserRouter, useLocation } from "react-router-dom";
import AppRoutes from "./app/routes/AppRoutes";
import NavBar from "./components/Navbar";
import FooterBar from "./components/FooterBar";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./features/auth/AuthContext";

const DASHBOARD_PREFIXES = ["/receptionist", "/dentist", "/admin"];

function Chrome({ children }) {
  const location = useLocation();
  const isDashboard = DASHBOARD_PREFIXES.some((prefix) =>
    location.pathname.startsWith(prefix)
  );

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

function RoutedErrorBoundary({ children }) {
  const location = useLocation();
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

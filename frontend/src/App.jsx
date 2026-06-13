import { ToastProvider } from "./context/ToastContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";
import Auth from "./pages/Auth";
import Layout from "./pages/Layout";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import "./index.css";

function TravellerApp() {
  const { token } = useAuth();
  if (!token) return <Auth />;
  return <Layout />;
}

function AdminApp() {
  const { token } = useAdminAuth();
  if (!token) return <AdminLogin />;
  return <AdminDashboard />;
}

export default function App() {
  const isAdmin = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");

  return (
    <ToastProvider>
      {isAdmin ? (
        <AdminAuthProvider>
          <AdminApp />
        </AdminAuthProvider>
      ) : (
        <AuthProvider>
          <TravellerApp />
        </AuthProvider>
      )}
    </ToastProvider>
  );
}

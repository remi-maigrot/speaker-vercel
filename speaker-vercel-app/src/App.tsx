import { Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/landing";
import { Dashboard } from "./pages/dashboard";
import { Marketplace } from "./components/marketplace";
import { AuthPage } from "./pages/auth";
import { Navbar } from "./components/navbar";
import { Footer } from "./components/footer";
import { useAuth } from "./hooks/use-auth";

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <AuthPage />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage type="register" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { MobileNav } from "./components/MobileNav";
import { RequireAuth } from "./components/RequireAuth";
import { SetupNotice } from "./components/SetupNotice";
import { HomePage } from "./pages/HomePage";
import { LocationPage } from "./pages/LocationPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SubmitPage } from "./pages/SubmitPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { LegalPage } from "./pages/LegalPage";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { Dashboard } from "./pages/admin/Dashboard";
import { Moderation } from "./pages/admin/Moderation";
import { Places } from "./pages/admin/Places";
import { Reports } from "./pages/admin/Reports";
import { Claims } from "./pages/admin/Claims";
import { Ads } from "./pages/admin/Ads";
import { Stats } from "./pages/admin/Stats";
import { Users } from "./pages/admin/Users";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SetupNotice />
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/location/:slug" element={<LocationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/legal" element={<Navigate to="/legal/mentions" replace />} />
          <Route path="/legal/:page" element={<LegalPage />} />
          <Route path="/submit" element={<RequireAuth><SubmitPage /></RequireAuth>} />
          <Route path="/favorites" element={<RequireAuth><FavoritesPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/propose" element={<Navigate to="/submit" replace />} />
          <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
          <Route path="/admin" element={<RequireAuth moderator><AdminLayout /></RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="moderation" element={<Moderation />} />
            <Route path="places" element={<Places />} />
            <Route path="reports" element={<Reports />} />
            <Route path="claims" element={<Claims />} />
            <Route path="ads" element={<Ads />} />
            <Route path="stats" element={<Stats />} />
            <Route path="users" element={<Users />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}

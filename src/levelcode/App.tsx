import { Route, Routes } from "react-router-dom";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import DownloadPage from "./pages/DownloadPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import PricingPage from "./pages/PricingPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";

// Client routes are relative to the /ai basename (set in main.tsx):
//   /ai        → landing        /ai/login    → sign in
//   /ai/pricing → plans         /ai/account  → usage dashboard (auth-gated)
//   /ai/admin  → admin dashboard (admin role only; enforced client + server side)
//   /ai/terms, /ai/privacy → legal (served publicly as levelcode.ai/terms, /privacy)
//   /ai/download → macOS downloads (served publicly as levelcode.ai/download)
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/download" element={<DownloadPage />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

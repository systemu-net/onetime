import { Route, Routes } from "react-router-dom";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import PricingPage from "./pages/PricingPage";

// Client routes are relative to the /ai basename (set in main.tsx):
//   /ai        → landing        /ai/login    → sign in
//   /ai/pricing → plans         /ai/account  → usage dashboard (auth-gated)
//   /ai/admin  → admin dashboard (admin role only; enforced client + server side)
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

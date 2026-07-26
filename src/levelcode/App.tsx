import { Route, Routes, useParams } from "react-router-dom";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import DocsPage from "./pages/DocsPage";
import DownloadPage from "./pages/DownloadPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import PricingPage from "./pages/PricingPage";
import PrivacyPage from "./pages/PrivacyPage";
import ReferralsPage from "./pages/ReferralsPage";
import TermsPage from "./pages/TermsPage";

// Client routes are relative to the /ai basename (set in main.tsx):
//   /ai        → landing        /ai/login    → sign in
//   /ai/pricing → plans         /ai/account  → usage dashboard (auth-gated)
//   /ai/admin  → admin dashboard (admin role only; enforced client + server side)
//   /ai/admin/referrals → referral funnel: clicks → signups → paid, per channel
//   /ai/terms, /ai/privacy → legal (served publicly as levelcode.ai/terms, /privacy)
//   /ai/download → macOS downloads (served publicly as levelcode.ai/download)
//   /ai/docs, /ai/docs/:slug → documentation (served publicly as levelcode.ai/docs).
//     This is the CANONICAL home of the LevelCode docs; levelcode.dev/docs redirects here.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/referrals" element={<ReferralsPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/download" element={<DownloadPage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/docs/:slug" element={<DocsRoute />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

/** Pulls the slug out of the URL so DocsPage stays a plain presentational component. */
function DocsRoute() {
  const { slug } = useParams<{ slug: string }>();
  return <DocsPage slug={slug} />;
}

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { LinksProvider } from "./context/LinksContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./Notifications";
import AnalyticsPage from "./pages/Analytics";
import CreatePage from "./pages/CreatePage";
import CreateQrCode from "./pages/CreateQrCode";
import DashboardPage from "./pages/Dashboard";
import FeaturesPage from "./pages/FeaturesPage";
import HomePage from "./pages/HomePage";
import CookiesPage from "./pages/legal/CookiesPage";
import PrivacyPage from "./pages/legal/PrivacyPage";
import TermsPage from "./pages/legal/TermsPage";
import UserPolicyPage from "./pages/legal/UserPolicyPage";
import LinkPage from "./pages/Link";
import LinksPage from "./pages/LinksPage";
import LoginPage from "./pages/LoginPage";
import SinglePage from "./pages/Page";
import PagesPage from "./pages/Pages";
import ProfilePage from "./pages/ProfilePage";
import QrCodePage from "./pages/QrCode";
import QrCodesPage from "./pages/QrCodesPage";
import RegisterPage from "./pages/RegisterPage";
import ResourcesPage from "./pages/ResourcesPage";
import SettingsPage from "./pages/Settings";
import StatsPage from "./pages/Stats";

import CampaignsPage from "./pages/CampaignsPage";
import GovernancePage from "./pages/GovernancePage";
import PlansPage from "./pages/Plans";
import {
  ANALYTICS_ROUTE,
  CAMPAIGNS_ROUTE,
  COOKIES_ROUTE,
  CREATE_PAGES_ROUTE,
  CREATE_QR_ROUTE,
  DASHBOARD_ROUTE,
  FEATURES_ROUTE,
  GOVERNANCE_ROUTE,
  LINKS_ROUTE,
  LOGIN_ROUTE,
  PAGES_ROUTE,
  PLANS_ROUTE,
  PRIVACY_ROUTE,
  PROFILE_ROUTE,
  QR_ROUTE,
  REGISTER_ROUTE,
  RESOURCES_ROUTE,
  SETTINGS_ROUTE,
  STATS_ROUTE,
  TERMS_ROUTE,
  USER_POLICY_ROUTE,
} from "./routes";

export const App = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <LinksProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path={FEATURES_ROUTE} element={<FeaturesPage />}></Route>
              <Route path={PLANS_ROUTE} element={<PlansPage />}></Route>
              <Route path={RESOURCES_ROUTE} element={<ResourcesPage />}></Route>
              <Route path={REGISTER_ROUTE} element={<RegisterPage />}></Route>
              <Route path={LOGIN_ROUTE} element={<LoginPage />}></Route>

              {/* Legal routes */}
              <Route path={TERMS_ROUTE} element={<TermsPage />}></Route>
              <Route path={PRIVACY_ROUTE} element={<PrivacyPage />}></Route>
              <Route path={COOKIES_ROUTE} element={<CookiesPage />}></Route>
              <Route
                path={USER_POLICY_ROUTE}
                element={<UserPolicyPage />}
              ></Route>

              {/* Protected routes */}
              <Route
                path={SETTINGS_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={DASHBOARD_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={LINKS_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <LinksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="links/:lookup_code"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <LinkPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={QR_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <QrCodesPage />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path={CREATE_QR_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <CreateQrCode />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path={`${QR_ROUTE}/:qr_code`}
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <QrCodePage />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path={PAGES_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PagesPage />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path={`${PAGES_ROUTE}/:lookup_code`}
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <SinglePage />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path={CREATE_PAGES_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <CreatePage />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path={ANALYTICS_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path={PLANS_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PlansPage />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path={PROFILE_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path={STATS_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <StatsPage />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path={GOVERNANCE_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <GovernancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={CAMPAIGNS_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <CampaignsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/landing" element={<HomePage />}></Route>
              <Route path="*" element={<HomePage />}></Route>
            </Routes>
          </Router>
        </LinksProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;

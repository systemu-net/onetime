import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicProfilePage from "./pages/PublicProfilePage";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./Notifications";
import AboutPage from "./pages/AboutPage";
import AnalyticsPage from "./pages/Analytics";
import ContactPage from "./pages/ContactPage";
import CreatePage from "./pages/CreatePage";
import DashboardPage from "./pages/Dashboard";
import FeaturesPage from "./pages/FeaturesPage";
import HomePage from "./pages/HomePage";
import CookiesPage from "./pages/legal/CookiesPage";
import PrivacyPage from "./pages/legal/PrivacyPage";
import TermsPage from "./pages/legal/TermsPage";
import UserPolicyPage from "./pages/legal/UserPolicyPage";
import LoginPage from "./pages/LoginPage";
import SinglePage from "./pages/Page";
import PagesPage from "./pages/Pages";
import PagesMockup from "./pages/PagesMockup";
import PageEditorMockup from "./pages/PageEditorMockup";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import ResourcesPage from "./pages/ResourcesPage";
import SettingsPage from "./pages/Settings";
import StatsPage from "./pages/Stats";

import CampaignsPage from "./pages/CampaignsPage";
import GovernancePage from "./pages/GovernancePage";
import PlansPage from "./pages/Plans";
import {
  ABOUT_ROUTE,
  ANALYTICS_ROUTE,
  CAMPAIGNS_ROUTE,
  CONTACT_ROUTE,
  COOKIES_ROUTE,
  CREATE_PAGES_ROUTE,
  DASHBOARD_ROUTE,
  FEATURES_ROUTE,
  GOVERNANCE_ROUTE,
  LOGIN_ROUTE,
  PAGES_ROUTE,
  PLANS_ROUTE,
  PRIVACY_ROUTE,
  PROFILE_HANDLE_PATTERN,
  PROFILE_ROUTE,
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
        <Router>
          <Routes>
              {/* Public @handle profile (serves owner editor + public view) */}
              <Route path={PROFILE_HANDLE_PATTERN} element={<PublicProfilePage />}></Route>
              {/* Public routes */}
              <Route path={FEATURES_ROUTE} element={<FeaturesPage />}></Route>
              <Route path={PLANS_ROUTE} element={<PlansPage />}></Route>
              <Route path={RESOURCES_ROUTE} element={<ResourcesPage />}></Route>
              <Route path={ABOUT_ROUTE} element={<AboutPage />}></Route>
              <Route path={CONTACT_ROUTE} element={<ContactPage />}></Route>
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
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={DASHBOARD_ROUTE}
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={PAGES_ROUTE}
                element={
                  <ProtectedRoute>
                    <PagesPage />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path={`${PAGES_ROUTE}/:lookup_code`}
                element={
                  <ProtectedRoute>
                    <SinglePage />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/pages-mockup"
                element={
                  <ProtectedRoute>
                    <PagesMockup />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/pages-mockup/edit"
                element={
                  <ProtectedRoute>
                    <PageEditorMockup />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path={CREATE_PAGES_ROUTE}
                element={
                  <ProtectedRoute>
                    <CreatePage />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path={ANALYTICS_ROUTE}
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path={PLANS_ROUTE}
                element={
                  <ProtectedRoute>
                    <PlansPage />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path={PROFILE_ROUTE}
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path={STATS_ROUTE}
                element={
                  <ProtectedRoute>
                    <StatsPage />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path={GOVERNANCE_ROUTE}
                element={
                  <ProtectedRoute>
                    <GovernancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={CAMPAIGNS_ROUTE}
                element={
                  <ProtectedRoute>
                    <CampaignsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/landing" element={<HomePage />}></Route>
              <Route path="*" element={<HomePage />}></Route>
            </Routes>
          </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;

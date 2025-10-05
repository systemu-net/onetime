import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { LinksProvider } from './context/LinksContext';
import { NotificationProvider } from './Notifications';
import AnalyticsPage from './pages/Analytics';
import CreatePage from './pages/CreatePage';
import CreateQrCode from './pages/CreateQrCode';
import DashboardPage from './pages/Dashboard';
import HomePage from './pages/HomePage';
import LinkPage from './pages/Link';
import LinksPage from './pages/LinksPage';
import LoginPage from './pages/LoginPage';
import SinglePage from './pages/Page';
import PagesPage from './pages/Pages';
import PricingPage from './pages/PricingPage';
import ProfilePage from './pages/ProfilePage';
import QrCodePage from './pages/QrCode';
import QrCodesPage from './pages/QrCodesPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/Settings';
import StatsPage from './pages/Stats';

import {
  ANALYTICS_ROUTE,
  CREATE_PAGES_ROUTE,
  CREATE_QR_ROUTE,
  DASHBOARD_ROUTE,
  LINKS_ROUTE,
  LOGIN_ROUTE,
  PAGES_ROUTE,
  PRICING_ROUTE,
  PROFILE_ROUTE,
  QR_ROUTE,
  REGISTER_ROUTE,
  SETTINGS_ROUTE,
  STATS_ROUTE
} from './routes';

export const App = () => {
  return (
    <NotificationProvider>
      <LinksProvider>

        <Router>
          <Routes>
            {/* Public routes */}
            <Route path={PRICING_ROUTE} element={<PricingPage />}></Route>
            <Route path={REGISTER_ROUTE} element={<RegisterPage />}></Route>
            <Route path={LOGIN_ROUTE} element={<LoginPage />}></Route>

            {/* Protected routes */}
            <Route
              path={SETTINGS_ROUTE}
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={DASHBOARD_ROUTE}
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={LINKS_ROUTE}
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <LinksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="links/:lookup_code"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <LinkPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={QR_ROUTE}
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <QrCodesPage />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path={CREATE_QR_ROUTE
              }
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CreateQrCode />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path={`${QR_ROUTE}/:qr_code`}
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <QrCodePage />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path={PAGES_ROUTE}
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PagesPage />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path={`${PAGES_ROUTE}/:lookup_code`}
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SinglePage />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path={CREATE_PAGES_ROUTE}
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CreatePage />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path={ANALYTICS_ROUTE}
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path={PROFILE_ROUTE}
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path={STATS_ROUTE}
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StatsPage />
                </ProtectedRoute>
              }
            ></Route>
            <Route path="/landing" element={<HomePage />}></Route>
            <Route path="*" element={<HomePage />}></Route>
          </Routes>
        </Router>
      </LinksProvider>
    </NotificationProvider>
  );
};

export default App;

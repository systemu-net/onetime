import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { NotificationProvider } from './Notifications';
import CreateQrCode from './pages/CreateQrCode';
import DashboardPage from './pages/Dashboard';
import HomePage from './pages/HomePage';
import LinkPage from './pages/Link';
import LinksPage from './pages/LinksPage';
import LoginPage from './pages/LoginPage';
import PagesPage from './pages/Pages';
import PricingPage from './pages/PricingPage';
import ProfilePage from './pages/ProfilePage';
import QrCodePage from './pages/QrCode';
import QrCodesPage from './pages/QrCodesPage';
import RegisterPage from './pages/RegisterPage';
import {
  CREATE_QR_ROUTE,
  DASHBOARD_ROUTE,
  LINKS_ROUTE,
  LOGIN_ROUTE,
  PAGES_ROUTE,
  PRICING_ROUTE,
  PROFILE_ROUTE,
  QR_ROUTE,
  REGISTER_ROUTE
} from './routes';

export const App = () => {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path={PRICING_ROUTE} element={<PricingPage />}></Route>
          <Route path={REGISTER_ROUTE} element={<RegisterPage />}></Route>
          <Route path={LOGIN_ROUTE} element={<LoginPage />}></Route>

          {/* Protected routes */}
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
            path={PROFILE_ROUTE}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          ></Route>

          <Route path="/landing" element={<HomePage />}></Route>
          <Route path="*" element={<HomePage />}></Route>
        </Routes>
      </Router>
    </NotificationProvider>
  );
};

export default App;

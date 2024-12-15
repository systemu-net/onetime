import {Route, BrowserRouter as Router, Routes} from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/Dashboard';
import HomePage from './pages/HomePage';
import LinksPage from './pages/LinksPage';
import LoginPage from './pages/LoginPage';
import PricingPage from './pages/PricingPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import {
  DASHBOARD_ROUTE,
  LINKS_ROUTE,
  LOGIN_ROUTE,
  PRICING_ROUTE,
  QR_ROUTE,
  REGISTER_ROUTE,
  PROFILE_ROUTE,
} from './routes';

export const App = () => {
  return (
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
        ></Route>
        <Route
          path={LINKS_ROUTE}
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LinksPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={QR_ROUTE}
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LinksPage />
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
  );
};

export default App;

import {Route, BrowserRouter as Router, Routes} from 'react-router-dom';
import DashboardPage from './pages/Dashboard';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PricingPage from './pages/PricingPage';
import RegisterPage from './pages/RegisterPage';
import {
  DASHBOARD_ROUTE,
  LOGIN_ROUTE,
  PRICING_ROUTE,
  REGISTER_ROUTE,
} from './routes';

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path={PRICING_ROUTE} element={<PricingPage />}></Route>
        <Route path={REGISTER_ROUTE} element={<RegisterPage />}></Route>
        <Route path={LOGIN_ROUTE} element={<LoginPage />}></Route>
        <Route path={DASHBOARD_ROUTE} element={<DashboardPage />}></Route>
        <Route path="*" element={<HomePage />}></Route>
      </Routes>
    </Router>
  );
};

export default App;

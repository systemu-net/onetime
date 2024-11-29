import {Route, BrowserRouter as Router, Routes} from 'react-router-dom'
import HomePage from './pages/HomePage'
import PricingPage from './pages/PricingPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import {PRICING_ROUTE, REGISTER_ROUTE, LOGIN_ROUTE} from './routes'

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path={PRICING_ROUTE} element={<PricingPage />}></Route>
        <Route path={REGISTER_ROUTE} element={<RegisterPage />}></Route>
        <Route path={LOGIN_ROUTE} element={<LoginPage/>}></Route>
        <Route path="*" element={<HomePage />}></Route>
      </Routes>
    </Router>
  )
}

export default App

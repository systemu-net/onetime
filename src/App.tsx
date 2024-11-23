import {Route, BrowserRouter as Router, Routes} from 'react-router-dom'
import HomePage from './components/pages/Home'
import PricingPage from './components/pages/Pricing'
import {PRICING_ROUTE} from './routes'

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path={PRICING_ROUTE} element={<PricingPage />}></Route>
        <Route path="*" element={<HomePage />}></Route>
      </Routes>
    </Router>
  )
}

export default App

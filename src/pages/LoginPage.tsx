import Authentication, { LOGIN } from '../components/Authentication'
import Boost from '../components/Boost'
import Footer from '../components/Footer'
import Header from '../components/Header'

const LoginPage = () => {
  return (
    <>
      <Header />
      <Authentication pageType={LOGIN} />
      <Boost />
      <Footer />
    </>
  )
}

export default LoginPage

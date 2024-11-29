import Boost from '../components/Boost'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Authentication, { PageType } from '../components/Authentication'

const LoginPage = () => {
  return (
    <>
      <Header />
      <Authentication pageType={PageType.LOGIN} />
      <Boost />
      <Footer />
    </>
  )
}

export default LoginPage

import Boost from '../components/Boost'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Authentication, { PageType } from '../components/Authentication'

const RegisterPage = () => {
  return (
    <>
      <Header />
      <Authentication pageType={PageType.REGISTER} />
      <Boost />
      <Footer />
    </>
  )
}

export default RegisterPage

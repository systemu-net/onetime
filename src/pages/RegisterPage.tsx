import Authentication, { REGISTER } from '../components/Authentication'
import Boost from '../components/Boost'
import Footer from '../components/Footer'
import Header from '../components/Header'

const RegisterPage = () => {
  return (
    <>
      <Header />
      <Authentication pageType={REGISTER} />
      <Boost />
      <Footer />
    </>
  )
}

export default RegisterPage

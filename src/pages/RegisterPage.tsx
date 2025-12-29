import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Authentication, { REGISTER } from '../components/Authentication';
import Boost from '../components/Boost';
import Footer from '../components/Footer';
import Header from '../components/Header';

const RegisterPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.focusEmail) {
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Focus email input after a short delay to ensure rendering is complete
      setTimeout(() => {
        const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
        if (emailInput) {
          emailInput.focus();
        }
      }, 300);
    }
  }, [location]);

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

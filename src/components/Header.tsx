import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { logoutApi } from '../apis/authentication';
import Logo from '../assets/thinly.svg';
import { LOGIN_ROUTE, PRICING_ROUTE, REGISTER_ROUTE } from '../routes';

const Header = () => {
  const [click, setClick] = useState(false);
  const [cookies, , removeCookie] = useCookies(['token']);

  const handleLogout = async () => {
    const [result, error] = await logoutApi(cookies.token);
    handleLogoutResponse(result, error);
  }

  // @ts-ignore
  const handleLogoutResponse = (result, error) => {
    if (error) {
      console.error(error);
      removeCookie('token');
    } else {
      removeCookie('token');
    }
  }

  const toggleNavClick = () => {
    setClick(!click);
  }

  return (
    <header className="header">
      <div className="content | container">
        { /* Desktop Navbar */}
        <nav className="nav">
          <div className="nav__inner">
            <Link to='/' className="logo">
              <img src={Logo} alt="Logo" />
            </Link>

            { /* Nav links */}
            <ul className="nav__links | hide">
              <li><a className="nav__link" href="">Features</a></li>
              <li><Link to={PRICING_ROUTE} className="nav__link">Pricing</Link></li>
              <li><a className="nav__link" href="">Resources</a></li>
            </ul>
          </div>

          <div className="buttons | hide">
            {cookies.token ? (
              <button onClick={handleLogout} className="nav__link | btn" datatype="narrow">Logout</button>
            ) : (
              <>
                <Link to={LOGIN_ROUTE} className="nav__link">Login</Link>
                <Link to={REGISTER_ROUTE} className="nav__link | btn" datatype="narrow">Sign Up</Link>
              </>
            )}
          </div>
        </nav>

        { /* Mobile Navbar */}
        <nav className={`mobile-nav ${click ? 'show' : ''}`}>
          <ul className="nav__links | primary">
            <li><a className="nav__link" href="">Features</a></li>
            <li><Link to={PRICING_ROUTE} className="nav__link">Pricing</Link></li>
            <li><a className="nav__link" href="">Resources</a></li>
          </ul>

          {cookies.token ? (
            <ul className="nav__links | secondary">
              <li><button onClick={handleLogout} className="nav__link | btn" datatype="wide">Logout</button></li>
            </ul>
          ) : (
            <ul className="nav__links | secondary">
              <li><Link to={LOGIN_ROUTE} className="nav__link | btn" datatype="wide">Login</Link></li>
              <li><Link to={REGISTER_ROUTE} className="nav__link | btn" datatype="wide">Sign Up</Link></li>
            </ul>
          )}
        </nav>

        { /* Menu Icons */}
        <div className="menu-icons" onClick={toggleNavClick}>
          {click ? (
            <button><i className="fa-solid fa-close"></i></button>
          ) : (
            <button><i className="fa-solid fa-bars"></i></button>
          )}
        </div>
      </div>
    </header>
  )
};

export default Header;
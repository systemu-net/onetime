import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/thinly.svg';
import { LOGIN_ROUTE, PRICING_ROUTE, REGISTER_ROUTE } from '../routes';

const Header = () => {
  const [click, setClick] = useState(false);

  const toggleNavClick = () => {
    setClick(!click);
  }

  return (
    <header className="header">
      <div className="content | container">
        { /* Desktop Navbar */ }
        <nav className="nav">
          <div className="nav__inner">
            <Link to='/' className="logo">
              <img src={Logo} alt="Logo" />
            </Link>

            { /* Nav links */ }
            <ul className="nav__links | hide">
              <li><a className="nav__link" href="">Features</a></li>
              <li>
                <Link to={PRICING_ROUTE} className="nav__link">
                  Pricing
                </Link>
              </li>
              <li><a className="nav__link" href="">Resources</a></li>
            </ul>
          </div>

          <div className="buttons | hide">
            <Link to={LOGIN_ROUTE} className="nav__link">Login</Link>
            <Link to={REGISTER_ROUTE} className="nav__link | btn" datatype="narrow">Sign Up</Link>
          </div>
        </nav>

        { /* Mobile Navbar */ }
        <nav className={`mobile-nav ${click ? 'show' : ''}`}>
          <ul className="nav__links | primary">
            <li><a className="nav__link" href="">Features</a></li>
            <li><a className="nav__link" href="">Pricing</a></li>
            <li><a className="nav__link" href="">Resources</a></li>
          </ul>

          <ul className="nav__links | secondary">
            <li><a href="/" className="nav__link | btn" datatype="wide">Login</a></li>
            <li><a href="" className="nav__link | btn" datatype="wide">Sign Up</a></li>
          </ul>
        </nav>

        { /* Menu Icons */ }
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
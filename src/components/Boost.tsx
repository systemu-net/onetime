import { useNavigate } from 'react-router-dom';
import { REGISTER_ROUTE } from '../routes';

const Boost = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(REGISTER_ROUTE, { state: { focusEmail: true } });
  };

  return (
    <section className="boost">
      <div className="boost__content" onClick={handleClick} style={{ cursor: 'pointer' }}>
        <h2>Boost your links today</h2>
        <button className="btn" datatype="narrow">Get Started</button>
      </div>
    </section>
  )
}

export default Boost;
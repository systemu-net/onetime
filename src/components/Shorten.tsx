import { FormEvent, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { DASHBOARD_ROUTE, LOGIN_ROUTE } from '../routes';


const Shorten = () => {
  const [cookies] = useCookies(['token']);
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!cookies.token) {
      return navigate(LOGIN_ROUTE);
    }

    if (!url) {
      setErrorMessage('Please add a link');
    } else {
      setErrorMessage('');
    }

    navigate(DASHBOARD_ROUTE);
  }

  return (
    <section className="shorten">
      <div className="container">
        {/* Shorten content */}
        <div className="shorten__content">
          <form onSubmit={handleSubmit} className="form">
            <div className="input-control">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={`${errorMessage ? 'error-input' : ''}`}
                type="text"
                placeholder='Shorten a link'
              />
              {errorMessage && (
                <p className="error-text">{errorMessage}</p>
              )}
            </div>

            <button className="btn" datatype="wide" disabled={loading}>
              {loading ? 'Thinlifying...' : 'Thinlify'}
            </button>

            {/* <Button loading={loading}/> */}
          </form>
        </div>
      </div>
    </section>
  )
}

export default Shorten;
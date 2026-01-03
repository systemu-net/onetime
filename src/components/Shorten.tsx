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
    <section className="shorten dark:bg-zinc-900">
      <div className="container">
        {/* Shorten content */}
        <div className="shorten__content">
          <form onSubmit={handleSubmit} className="form">
            <div className="input-control">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={`dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${errorMessage ? 'error-input' : ''}`}
                type="text"
                placeholder='Shorten a link'
              />
              {errorMessage && (
                <p className="error-text">{errorMessage}</p>
              )}
            </div>

            <button className="btn" datatype="wide" disabled={loading}>
              {loading ? 'Thinlifying...' : 'Thinly'}
            </button>

            {/* <Button loading={loading}/> */}
          </form>
        </div>
      </div>
    </section>
  )
}

export default Shorten;
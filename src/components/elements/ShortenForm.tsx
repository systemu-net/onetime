import { FormEvent, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { shortenApi } from '../../apis/shorten';
import { LOGIN_ROUTE } from '../../routes';

const ShortenForm = ({ fetchLinks }) => {
  const [cookies] = useCookies(['token']);
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!cookies.token) {
      return navigate(LOGIN_ROUTE);
    }

    if (!url) {
      return setErrorMessage('Please add a link');
    } else {
      setErrorMessage('');
    }

    try {
      setLoading(true);

      const [response, error] = await shortenApi(cookies.token, {
        link: {
          original_url: url
        }
      });

      if (error) {
        // @ts-ignore
        setErrorMessage(error);
      } else {
        // const data = await response.json();
        // @ts-ignore
        if (response.ok) {
          setErrorMessage('');
          setUrl('');
          fetchLinks();
        } else {
          setErrorMessage(error);
        }
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900">
          Create new thin.ly url
        </h3>
        <form onSubmit={handleSubmit} className="mt-5 sm:flex sm:items-center">
          <div className="w-full sm:max-w-lg">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              id="url"
              name="url"
              type="text"
              placeholder="https://thin.ly"
              aria-label="url"
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            />
            {errorMessage && (
              <p className="error-text">{errorMessage}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
          >
            {loading ? 'Shortening...' : 'Shorten It!'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShortenForm;

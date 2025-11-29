import { FormEvent, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../apis/config';
import { shortenApi } from '../../apis/shorten';
import { LOGIN_ROUTE } from '../../routes';
import { AnimatedShortTextIcon } from '../icons/AnimatedShortTextIcon';
import { Subheading } from './heading';

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
        setErrorMessage(typeof error === 'string' ? error : 'An unexpected error occurred');
      } else {
        if (typeof response !== 'string' && response.ok) {
          const data = await response.json();
          const lookupCode = data.link?.lookup_code || data.lookup_code;
          
          if (lookupCode) {
            const shortUrl = `${API_URL}/${lookupCode}`;
            navigator.clipboard.writeText(shortUrl);
          }
          
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
    <div className="bg-white dark:bg-zinc-900 shadow rounded-lg mb-4">
      <div className="px-4 py-5 lg:p-8">
        <Subheading>
          Create new thin.ly url
        </Subheading>
        <form onSubmit={handleSubmit} className="mt-3 sm:flex sm:items-center">
          <div className="w-full sm:max-w-lg">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              id="url"
              name="url"
              type="text"
              placeholder="https://thin.ly"
              aria-label="url"
              className="block w-full rounded-md bg-white dark:bg-zinc-900 px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 dark:outline-zinc-600 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-violet-600 sm:text-sm/6"
            />
            {errorMessage && (
              <p className="error-text">{errorMessage}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 sm:ml-3 sm:mt-0 sm:w-auto"
          >
            <AnimatedShortTextIcon size={20} isAnimating={true} />
            {loading ? 'Thinlifying...' : 'Thinlify'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShortenForm;

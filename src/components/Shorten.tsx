import { FormEvent, useEffect, useState } from 'react';
import { shortenApi, getLinks } from '../apis/shorten';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { LOGIN_ROUTE } from '../routes';
import { API_URL } from '../apis/config';

interface ShortenUrl {
  id: number;
  lookup_code: string;
  original_url: string;
  created_at: string;
  updated_at: string;
}

const Shorten = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [shortenedUrls, setShortenedUrls] = useState<ShortenUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // save the data when changes are made
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const [response, error] = await getLinks(cookies.token);

      if (error) {
        setErrorMessage(error);
      } else {
        const data = await response.json();

        // TODO: investigate why this is called 2 times
        // debugger;


        if (response.ok) {
          setShortenedUrls(data.links);
        } else {
          setErrorMessage(data.message);
        }
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('');
    }
  }

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

    try {
      setLoading(true);

      const [response, error] = await shortenApi(cookies.token, {
        link: {
          original_url: url
        }
      });

      if (error) {
        setErrorMessage(error);
      } else {
        const data = await response.json();

        if (response.ok) {
          fetchLinks();
          setErrorMessage('');
          setUrl('');
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
  }

  const handleCopy = (shortUrl: string, index: number) => {
    navigator.clipboard.writeText(shortUrl);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
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
              {loading ? 'Shortening...' : 'Shorten It!'}
            </button>

            {/* <Button loading={loading}/> */}
          </form>
        </div>

        {/* Shorten Output */}
        {shortenedUrls.length > 0 && (
          <div className="shorten__cards">
            {/* Shorten Card */}
            {shortenedUrls.map((shortenedUrl, index) => (
              <div key={index} className="shorten__card border rounded-md">
                <div className="actual__link">
                  <span>{shortenedUrl.original_url}</span>
                </div>

                <hr className="line" />

                <div className="shorten__link">
                  <a href={`${API_URL}/${shortenedUrl.lookup_code}`} target="_blank">{`${API_URL}/${shortenedUrl.lookup_code}`}</a>
                  <button className="btn" datatype="wide" onClick={() => handleCopy(`${API_URL}/${shortenedUrl.lookup_code}`, index)}>
                    {copiedIndex === index ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Shorten;
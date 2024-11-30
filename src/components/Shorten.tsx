import { FormEvent, useEffect, useState } from 'react';
import { shortenApi } from '../apis/shorten';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { LOGIN_ROUTE } from '../routes';

interface ShortenUrl {
  originalUrl: string;
  shortUrl: string;
}

const Shorten = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [shortenedUrls, setShortenedUrls] = useState<ShortenUrl[]>(() => {
    const savedShortenedUrls = localStorage.getItem('shortenUrls');
    if (savedShortenedUrls) {
      return JSON.parse(savedShortenedUrls);
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // save the data when changes are made
  useEffect(() => {
    localStorage.setItem('shortenUrls', JSON.stringify(shortenedUrls));
  }, [shortenedUrls]);

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

      debugger;
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
          setShortenedUrls([
            ...shortenedUrls, {
              originalUrl: url,
              shortUrl: data.lookup_code
            }
          ]);
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
          </form>
        </div>

        {/* Shorten Output */}
        {shortenedUrls.length > 0 && (
          <div className="shorten__cards">
            {/* Shorten Card */}
            {shortenedUrls.map((shortenedUrl, index) => (
              <div key={index} className="shorten__card">
              <div className="actual__link">
                <span>{shortenedUrl.originalUrl}</span>
              </div>

              <hr className="line" />

              <div className="shorten__link">
                <a href={`shortenedUrl.shortUrl`} target="_blank">{shortenedUrl.shortUrl}</a>
                <button className="btn" datatype="wide" onClick={() => handleCopy(shortenedUrl.shortUrl, index)}>
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
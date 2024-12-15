import { useEffect, useState } from 'react';
import ShortenForm from '../components/elements/ShortenForm';
import MainLayout from '../components/layouts/MainLayout';
import {LinksList} from '../components/sections/LinksList';
import { useCookies } from 'react-cookie';
import { getLinks } from '../apis/shorten';

interface ShortenUrl {
  id: number;
  lookup_code: string;
  original_url: string;
  created_at: string;
  updated_at: string;
}

const LinksPage = () => {
  const [cookies] = useCookies(['token']);
  const [errorMessage, setErrorMessage] = useState('');
  const [shortenedUrls, setShortenedUrls] = useState<ShortenUrl[]>([]);
  const fetchLinks = async () => {
    try {
      const [response, error] = await getLinks(cookies.token);
      if (error) {
        setErrorMessage(error);
      } else {
        const data = await response.json();
        // TODO: investigate why this is called 2 times - MS: because of StrictMode
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
  };

  return (
    <MainLayout>
      <ShortenForm fetchLinks={fetchLinks} />
      <h1 className="text-2xl my-4 pt-4 text-gray-700">Thinly links</h1>
      <LinksList fetchLinks={fetchLinks} shortenedUrls={shortenedUrls} />
    </MainLayout>
  );
};
export default LinksPage;

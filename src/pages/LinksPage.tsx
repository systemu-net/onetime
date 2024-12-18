import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { getLinks } from '../apis/shorten'; // Assuming you have a .ts file and not .js
import ShortenForm from '../components/elements/ShortenForm';
import MainLayout from '../components/layouts/MainLayout';
import { LinksList } from '../components/sections/LinksList';

type Link = {
  created_at: string;
  id: number;
  lookup_code: string;
  original_url: string;
  updated_at: string;
  user_id: number;
}

const LinksPage = () => {
  const [cookies] = useCookies(['token']);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [shortenedUrls, setShortenedUrls] = useState<Link[]>([]);

  const fetchLinks = async () => {
    if (!cookies.token) {
      setErrorMessage('No authentication token found.');
      return;
    }

    try {
      const links: Link[] = await getLinks(cookies.token);
      setShortenedUrls(links);
    } catch (error: unknown) {
      console.error(error);
      setErrorMessage('An error occurred while fetching links.');
    }
  };

  // Optionally, you can call fetchLinks when the component mounts (if needed)
  useEffect(() => {
    fetchLinks();
  }, [cookies.token]); // Runs when the token is available

  return (
    <MainLayout>
      <ShortenForm fetchLinks={fetchLinks} />
      <h1 className="text-2xl my-4 pt-4 text-gray-700">Thinly links</h1>
      <LinksList fetchLinks={fetchLinks} shortenedUrls={shortenedUrls} />
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </MainLayout>
  );
};

export default LinksPage;

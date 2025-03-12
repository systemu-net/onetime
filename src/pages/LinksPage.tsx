import { Heading } from '@/components/elements/heading';
import ShortenForm from '@/components/elements/ShortenForm';
import { Link } from '@/types';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { getLinks } from '../apis/shorten'; // Assuming you have a .ts file and not .js
import MainLayout from '../components/layouts/MainLayout';
import { LinksList } from '../components/sections/LinksList';


const LinksPage = () => {
  const [cookies] = useCookies(['token']);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [shortenedUrls, setShortenedUrls] = useState<Link[]>([]);

  const fetchLinks = async () => {
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
    if (cookies.token) {
      fetchLinks();
    }
  }, [cookies.token]); // Runs when the token is available

  return (
    <MainLayout>
      <ShortenForm fetchLinks={fetchLinks} />
      <div className="px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
        <Heading>
          Links
        </Heading>
        {/* <h1 className="text-2xl my-2 text-gray-700">Links</h1> */}
        {/* <Button>Create link</Button> */}
      </div>
      <LinksList fetchLinks={fetchLinks} shortenedUrls={shortenedUrls} />
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </MainLayout>
  );
};

export default LinksPage;

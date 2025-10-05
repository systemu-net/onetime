import { Heading } from '@/components/elements/heading';
import ShortenForm from '@/components/elements/ShortenForm';
import { useLinks } from '@/context/LinksContext';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import MainLayout from '../components/layouts/MainLayout';
import { LinksList } from '../components/sections/LinksList';

const LinksPage = () => {
  const [cookies] = useCookies(['token']);
  const { shortenedUrls, fetchLinks, errorMessage } = useLinks();

  useEffect(() => {
    if (cookies.token && !shortenedUrls.length) {
      fetchLinks();
    }
  }, [cookies.token, shortenedUrls.length, fetchLinks]);

  return (
    <MainLayout>
      <ShortenForm fetchLinks={fetchLinks} />
      <div className="px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
        <Heading>Links</Heading>
        {/* <h1 className="text-2xl my-2 text-gray-700">Links</h1> */}
        {/* <Button>Create link</Button> */}
      </div>
      <LinksList fetchLinks={fetchLinks} shortenedUrls={shortenedUrls} />
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </MainLayout>
  );
};

export default LinksPage;

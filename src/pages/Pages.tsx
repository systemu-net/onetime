import { getPages } from '@/apis/pages';
import { Button } from '@/components/elements/button';
import { Heading } from '@/components/elements/heading';
import { PagesList } from '@/components/sections/PagesList';
import { CREATE_PAGES_ROUTE } from '@/routes';
import { Page } from '@/types';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import MainLayout from '../components/layouts/MainLayout';

const PagesPage = () => {
  const [cookies] = useCookies(['token']);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [pages, setPages] = useState<Page[]>([]);

  const retrievePages = async () => {
    try {
      const res: Page[] = await getPages(cookies.token);
      setPages(res);
    } catch (error: unknown) {
      console.error(error);
      setErrorMessage('An error occurred while fetching pages codes.');
    }
  };

  // Optionally, you can call fetchLinks when the component mounts (if needed)
  useEffect(() => {
    if (cookies.token) {
      retrievePages();
    }
  }, [cookies.token]); // Runs when the token is available
  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
        <Heading>Pages</Heading>
        <Button to={CREATE_PAGES_ROUTE}>Create New Page</Button>
      </div>
      <PagesList fetchPages={retrievePages} pages={pages} />
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </MainLayout>
  );
};

export default PagesPage;

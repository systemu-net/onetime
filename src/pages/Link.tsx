import { Subheading } from '@/components/elements/heading';
import MainLayout from '@/components/layouts/MainLayout';
import { LINKS_ROUTE } from '@/routes';

import { getLink } from '@/apis/shorten';
import Box from '@/components/Box';
import { Button } from '@/components/elements/button';
import { ItemDetails } from '@/components/elements/ItemDetails';
import { extractDomain } from '@/utils/transformers';
import { ChevronLeftIcon } from '@heroicons/react/16/solid';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link as RouterLink, useParams } from 'react-router-dom';


import { createQrCode } from '@/apis/qr_codes';
import LinkStatsComponent from '@/components/LinkStatsComponent';
import { useNotification } from '@/Notifications';
import { Link } from '@/types';

const LinkPage = () => {
  const { lookup_code } = useParams();
  const [cookies] = useCookies(['token']);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { addNotification } = useNotification();

  const [link, setLink] = useState<Link | null>(null);

  useEffect(() => {
    const fetchLink = async () => {
      try {
        const link: Link = await getLink(cookies.token, lookup_code);
        setLink(link);
      } catch (error: unknown) {
        console.error(error);
        setErrorMessage('An error occurred while fetching links.');
      }
    };

    if (cookies.token) {
      fetchLink();
    }
  }, [cookies.token, lookup_code]); // Runs when the token or lookup_code is available

  const CreateQRCodeFromLink = async () => {
    if (link?.original_url) {
      try {
        setErrorMessage('');
        const code = await createQrCode(cookies.token, {
          qr_code: {
            lookup_code: lookup_code,
            title: extractDomain(link.original_url),
          },
        });
        console.log(code);
        addNotification('QrCode created', 'success');
      } catch (error: unknown) {
        console.error(error);
        setErrorMessage('An error occurred while creating qr code.');
      }
    }
  };

  return (
    <MainLayout>
      <div className="max-lg:hidden mb-3">
        <RouterLink
          to={LINKS_ROUTE}
          className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400"
        >
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Links
        </RouterLink>
      </div>
      <Box>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {link && (
          <ItemDetails
            title={extractDomain(link.original_url)}
            description={link.original_url}
            id={link.lookup_code}
            date={link.created_at}
            link={false}
          />
        )}
        {/* Statistics Section */}
        {link && <LinkStatsComponent link={link} />}
      </Box>
      <Box>
        <Subheading className="mt-4">QR Code</Subheading>
        <Button outline onClick={CreateQRCodeFromLink}>
          Create QR Code
        </Button>
      </Box>
    </MainLayout>
  );
};
export default LinkPage;

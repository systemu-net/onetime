import { ItemDetails } from '@/components/elements/ItemDetails';
import { QR_ROUTE } from '@/routes';
import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { getQrCode } from '../apis/qr_codes'; // Assuming you have a .ts file and not .js
import MainLayout from '../components/layouts/MainLayout';

export type QrCode = {
  id: number;
  image_url: string;
  link_id: number;
  created_at: string;
  updated_at: string;
};

const QrCodePage = () => {
  const [cookies] = useCookies(['token']);
  const { qr_code } = useParams();

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [qrCode, setQrCode] = useState<QrCode>();


  const fetchLink = async () => {
    try {
      const link: QrCode = await getQrCode(cookies.token, qr_code);
      setQrCode(link);
    } catch (error: unknown) {
      console.error(error);
      setErrorMessage('An error occurred while fetching links.');
    }
  };

  // Optionally, you can call fetchLinks when the component mounts (if needed)
  useEffect(() => {
    if (cookies.token) {
      fetchLink();
    }
  }, [cookies.token]); // Runs when the token is available

  return (
    <MainLayout>
      <div className="max-lg:hidden mb-3">
        <RouterLink to={QR_ROUTE} className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          QR Codes
        </RouterLink>
      </div>
      <div className='px-4 sm:px-6 lg:px-8 shadow rounded-lg bg-white'>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {qrCode && <ItemDetails
          id={qrCode.id.toString()}
          title={`Untitled QR Code ${qrCode.link_id}`}
          image_url={qrCode.image_url}
          date={qrCode.created_at}
        />}
      </div>
    </MainLayout>
  );
};

export default QrCodePage;

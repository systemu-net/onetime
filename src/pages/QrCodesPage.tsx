import { Button } from '@/components/elements/button';
import { Heading } from '@/components/elements/heading';
import { QrCodesList } from '@/components/sections/QrCodesList';
import { CREATE_QR_ROUTE } from '@/routes';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { getQrCodes } from '../apis/qr_codes'; // Assuming you have a .ts file and not .js
import MainLayout from '../components/layouts/MainLayout';

export type QrCode = {
  id: number;
  image_url: string;
  link_id: number;
  created_at: string;
  updated_at: string;
};

const QrCodesPage = () => {
  const [cookies] = useCookies(['token']);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);

  const retrieveQrCodes = async () => {
    try {
      const qrs: QrCode[] = await getQrCodes(cookies.token);
      setQrCodes(qrs);
    } catch (error: unknown) {
      console.error(error);
      setErrorMessage('An error occurred while fetching qr codes.');
    }
  };

  // Optionally, you can call fetchLinks when the component mounts (if needed)
  useEffect(() => {
    if (cookies.token) {
      retrieveQrCodes();
    }
  }, [cookies.token]); // Runs when the token is available

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
        <Heading>
          QR Codes
        </Heading>
        {/* <Button>Create link</Button> */}
        <Button to={CREATE_QR_ROUTE}>Create QR Code</Button>
      </div>
      <QrCodesList fetchQrCodes={retrieveQrCodes} qrCodes={qrCodes} />
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </MainLayout>
  );
};

export default QrCodesPage;

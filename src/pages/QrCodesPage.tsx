import { Heading } from '@/components/elements/heading';
import { QrCodesList } from '@/components/sections/QrCodesList';
import { QrCode } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { getQrCodes } from '../apis/qr_codes';
import MainLayout from '../components/layouts/MainLayout';

const QrCodesPage = () => {
  const [cookies] = useCookies(['token']);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);

  const retrieveQrCodes = useCallback(async () => {
    try {
      const qrs: QrCode[] = await getQrCodes(cookies.token);
      setQrCodes(qrs);
    } catch (error: unknown) {
      console.error(error);
      setErrorMessage('An error occurred while fetching qr codes.');
    }
  }, [cookies.token]);

  useEffect(() => {
    if (cookies.token) {
      retrieveQrCodes();
    }
  }, [cookies.token, retrieveQrCodes]);

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <Heading>
          QR Codes
        </Heading>
      </div>
      <QrCodesList fetchQrCodes={retrieveQrCodes} qrCodes={qrCodes} />
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </MainLayout>
  );
};

export default QrCodesPage;

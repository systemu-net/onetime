import Box from '@/components/Box';
import { Button } from '@/components/elements/button';
import { Divider } from '@/components/elements/divider';
import { Heading, Subheading } from '@/components/elements/heading';
import { Input } from '@/components/elements/input';
import { useNotification } from '@/Notifications';
import { QR_ROUTE } from '@/routes';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { createQrCode } from '../apis/qr_codes'; // Assuming you have a .ts file and not .js
import MainLayout from '../components/layouts/MainLayout';
import { QrCode } from '../types';

const CreateQrCode = () => {
  const [cookies] = useCookies(['token']);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [qrCode, setQrCode] = useState<QrCode | null>(null);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const createCode = async () => {
    if (!url) {
      return
    }
    try {
      setErrorMessage('')
      setQrCode(null);
      const code = await createQrCode(cookies.token, {
        qr_code: {
          original_url: url,
          title: title
        }
      });
      setQrCode(code);
      addNotification('QrCode created', "success");
      console.log(qrCode);
      navigate(QR_ROUTE)
    } catch (error: unknown) {
      console.error(error);
      setErrorMessage('An error occurred while creating qr code.');
    }
  };

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
        <Heading>
          Create QR Code
        </Heading>
      </div>

      {/* <div>
        <div aria-hidden="true" className="mt-6 w-2/3">
          <div className="overflow-hidden rounded-full bg-gray-200">
            <div style={{ width: '15.5%' }} className="h-2 rounded-full bg-violet-600" />
          </div>
          <div className="mt-6 hidden grid-cols-4 text-sm font-medium text-gray-600 sm:grid">
            <div className="text-violet-600">Creating QR code</div>
            <div className="text-right">Designing code</div>
          </div>
        </div>
      </div> */}

      <div className="pt-2">
        <div className="mt-2 flow-root">
          <Box>
            <section className="grid gap-x-8">
              <div className="space-y-1">
                <Subheading>Original url</Subheading>
                <Input aria-label="Original url" name="original_url" placeholder="https://example.com/long-url" onChange={(e) => setUrl(e.target.value)} required />
              </div>
            </section>

            <Divider className="my-6" soft />
            <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="space-y-1">
                <Subheading>Title (optional)</Subheading>
                <Input aria-label="Original url" name="original_url" placeholder="My new Thinly Code" onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
              </div>
            </section>

          </Box>
          <Button className='float-right cursor-pointer' onClick={createCode}>Create QR Code</Button>
        </div>
      </div>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </MainLayout>
  );
};

export default CreateQrCode;

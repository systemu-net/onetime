import { deleteQrCode } from '@/apis/qr_codes';
import { QrCode as QrCodeType } from '@/pages/QrCodesPage';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import Box from '../Box';
import { Button } from '../elements/button';
import { DownloadUrl } from '../elements/Download';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '../elements/dropdown';
import { ItemDetails } from '../elements/ItemDetails';

type QrCodesListProps = {
  fetchQrCodes: () => Promise<void>;
  qrCodes: QrCodeType[];
};
export const QrCodesList: React.FC<QrCodesListProps> = ({
  fetchQrCodes,
  qrCodes,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [cookies] = useCookies(['token']);

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const [response, error] = await deleteQrCode(cookies.token, id);

      if (error) {
        setLoading(false);
      } else {
        if (response instanceof Response && response.ok) {
          fetchQrCodes();
        } else {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-2">
      <div className="mt-2 flow-root">
        <ul>
          {qrCodes.map((item) => (
            <li key={item.image_url}>
              <Box>
                <div className="flex items-center justify-between">
                  <ItemDetails
                    id={item.id.toString()}
                    title={`Untitled QR Code ${item.link_id}`}
                    image_url={item.image_url}
                    date={item.created_at}
                  />
                  <div className="hidden lg:flex gap-4 items-center">
                    <DownloadUrl fileUrl={item.image_url} />
                    <Button outline to={item.id.toString()}>
                      Details
                    </Button>
                    <button
                      className="antialiased rounded-full font-bold w-7 h-7 hover:scale-105"
                      disabled={loading}
                      onClick={() => handleDelete(item.id)}
                    >
                      {/* <span className="">X</span> */}
                      <TrashIcon />
                    </button>
                  </div>
                  <div className="flex lg:hidden items-center gap-4">
                    <Dropdown>
                      <DropdownButton plain aria-label="More options">
                        <EllipsisVerticalIcon />
                      </DropdownButton>
                      <DropdownMenu anchor="bottom end">
                        <DropdownItem to={item.id.toString()}>
                          View
                        </DropdownItem>
                        <DropdownItem to={item.id + '/edit'}>Edit</DropdownItem>
                        <DropdownItem
                          disabled={loading}
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
              </Box>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

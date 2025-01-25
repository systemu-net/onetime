import { deleteLink } from '@/apis/shorten';
import { Link as LinkType } from '@/pages/LinksPage';
import { extractDomain } from '@/utils/transformers';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { API_URL } from '../../apis/config';
import { Button } from '../elements/button';
import { CopyUrl } from '../elements/Copy';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '../elements/dropdown';
import { ItemDetails } from '../elements/ItemDetails';

type LinksListProps = {
  fetchLinks: () => Promise<void>;
  shortenedUrls: LinkType[];
};
export const LinksList: React.FC<LinksListProps> = ({
  fetchLinks,
  shortenedUrls,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [cookies] = useCookies(['token']);
  const [copied, setCopied] = useState<boolean>(false);

  const handleDelete = async (lookup_code: string) => {
    try {
      setLoading(true);
      const [response, error] = await deleteLink(cookies.token, lookup_code);

      if (error) {
        setLoading(false);
      } else {
        if (response instanceof Response && response.ok) {
          fetchLinks();
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

  const handleCopy = (shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="pt-2">
      <div className="mt-2 flow-root">
        <ul>
          {shortenedUrls.map((item) => (
            <li
              key={item.lookup_code}
              className="mb-4 px-4 sm:px-6 lg:px-8 shadow rounded-lg bg-white dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <ItemDetails
                  title={extractDomain(item.original_url)}
                  description={item.original_url}
                  id={item.lookup_code}
                  date={item.created_at}
                />
                <div className="hidden lg:flex gap-4 items-center">
                  <CopyUrl code={item.lookup_code} />
                  {/* <Button outline to={item.lookup_code + '/edit'}>
                      Edit
                    </Button> */}
                  <Button outline to={item.lookup_code}>
                    Details
                  </Button>
                  <button
                    className="antialiased text-primary rounded-full font-bold w-7 h-7"
                    disabled={loading}
                    onClick={() => handleDelete(item.lookup_code)}
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
                      <DropdownItem
                        onClick={() => handleCopy(`${API_URL}/${item.lookup_code}`)}
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </DropdownItem>
                      <DropdownItem to={item.lookup_code}>View</DropdownItem>
                      <DropdownItem to={item.lookup_code + '/edit'}>Edit</DropdownItem>
                      <DropdownItem
                        disabled={loading}
                        onClick={() => handleDelete(item.lookup_code)}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

import { deletePage } from '@/apis/pages';
import { Page } from '@/types';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { Button } from '../elements/button';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '../elements/dropdown';
import Preview from './Preview';

type PagesListProps = {
  fetchPages: () => Promise<void>;
  pages: Page[];
};
export const PagesList: React.FC<PagesListProps> = ({ fetchPages, pages }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [cookies] = useCookies(['token']);

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const [response, error] = await deletePage(cookies.token, id);

      if (error) {
        setLoading(false);
      } else {
        if (response instanceof Response && response.ok) {
          fetchPages();
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
          {pages.map((item) => (
            <li
              key={item.url}
              className="mb-4 p-4 sm:px-6 lg:px-8 shadow rounded-lg bg-white dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <Link className="flex text-violet-700 " to={item.id.toString()}>
                  <div className="w-[53px] h-[100px] rounded-md shadow-md hover:shadow-lg mr-4">
                    <div className="scale-preview origin-top-left">
                      <Preview
                        title={item.url}
                        configuration={item.configuration}
                        previewIcon
                      />
                    </div>
                  </div>
                  <div className='hover:underline underline-offset-2'>
                    {item.url}
                  </div>
                </Link>

                <div className="hidden lg:flex gap-4 items-center">
                  <Button outline to={item.id.toString()}>
                    Details
                  </Button>
                  <button
                    className="antialiased text-primary rounded-full font-bold w-7 h-7 hover:scale-105"
                    disabled={loading}
                    onClick={() => handleDelete(item.id)}
                  >
                    <TrashIcon />
                  </button>
                </div>
                <div className="flex lg:hidden items-center gap-4">
                  <Dropdown>
                    <DropdownButton plain aria-label="More options">
                      <EllipsisVerticalIcon />
                    </DropdownButton>
                    <DropdownMenu anchor="bottom end">
                      <DropdownItem to={item.id.toString()}>View</DropdownItem>
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
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

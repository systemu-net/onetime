import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { getLinks } from '../../apis/shorten';
import { CopyUrl } from '../elements/Copy';

interface ShortenUrl {
  id: number;
  lookup_code: string;
  original_url: string;
  created_at: string;
  updated_at: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: '2-digit', // "12"
    day: '2-digit', // "08"
    year: 'numeric', // "2024"
    hour: '2-digit', // "11"
    minute: '2-digit', // "28"
    hour12: true, // 12-hour clock with AM/PM
  });
}

export const LinksList = () => {
  const [cookies] = useCookies(['token']);
  const [errorMessage, setErrorMessage] = useState('');
  const [shortenedUrls, setShortenedUrls] = useState<ShortenUrl[]>([]);

  // save the data when changes are made
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const [response, error] = await getLinks(cookies.token);

      if (error) {
        setErrorMessage(error);
      } else {
        const data = await response.json();

        // TODO: investigate why this is called 2 times - MS: because of StrictMode
        // debugger;

        if (response.ok) {
          setShortenedUrls(data.links);
        } else {
          setErrorMessage(data.message);
        }
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('');
    }
  };
  return (
    <div className="bg-white shadow sm:rounded-lg pt-4 px-4 sm:px-6 lg:px-8">
      <div className="mt-2 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    <a href="#" className="group inline-flex">
                      Url
                      <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                        <ChevronDownIcon
                          aria-hidden="true"
                          className="size-5"
                        />
                      </span>
                    </a>
                  </th>

                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    <a href="#" className="group inline-flex">
                      Code
                      <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                        <ChevronDownIcon
                          aria-hidden="true"
                          className="invisible ml-2 size-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible"
                        />
                      </span>
                    </a>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    <a href="#" className="group inline-flex">
                      Create At
                      <span className="ml-2 flex-none rounded bg-gray-100 text-gray-900 group-hover:bg-gray-200">
                        <ChevronDownIcon
                          aria-hidden="true"
                          className="size-5"
                        />
                      </span>
                    </a>
                  </th>

                  <th scope="col" className="relative py-3.5 pl-3 pr-0">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {shortenedUrls.map((url) => (
                  <tr key={url.original_url}>
                    <td
                      title={url.original_url}
                      className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0"
                    >
                      {url.original_url.length > 60
                        ? url.original_url.slice(0, 60) + '...'
                        : url.original_url}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 cursor-copy">
                      {url.lookup_code}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatDate(url.created_at)}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm sm:pr-0">
                      <CopyUrl code={url.lookup_code} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

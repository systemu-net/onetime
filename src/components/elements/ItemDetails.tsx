import { formatDate } from '@/utils/transformers';
import { CalendarIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL, SHORT_URL } from '../../apis/config';
import { base64Image } from '../images/base64Image';

type ItemDetailsProps = {
    title: string;
    id: string;
    date: string;
    description?: string;
    image_url?: string;
    link?: boolean;
}

export const ItemDetails = ({ title, description, id, date, image_url, link = true }: ItemDetailsProps) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = (lookupCode: string) => {
    navigator.clipboard.writeText(`${API_URL}/${lookupCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const content = (
    <span className="hover:underline hover:underline-offset-2 dark:text-zinc-200">
      {title}
    </span>
  );

  return (
    <div key={description} className="flex gap-6 pt-6 pb-2">
      <div className="shrink-0">
        {link ? (
          <Link to={id}>
            <img
              className={`${image_url ? 'w-30' : 'w-16'} aspect-square rounded-lg shadow dark:bg-zinc-100`}
              src={image_url ? image_url : 'https://' + title + '/favicon.ico'}
              alt={title}
              onError={(e) => {
                  (e.target as HTMLImageElement).src = base64Image; // Use base64 fallback image
              }}
            />
          </Link>
        ) : (
          <img
            className={`${image_url ? 'w-30' : 'w-16'} aspect-square rounded-lg shadow dark:bg-zinc-100`}
            src={image_url ? image_url : 'http://' + title + '/favicon.ico'}
            alt={title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = base64Image; // Replace with your fallback image path
            }}
          />
        )}
      </div>
      <div className="space-y-2">
        <div className="text-2xl font-bold">
          {link ? <Link to={id}>{content}</Link> : content}
        </div>
        
        {/* Short link with copy button */}
        <div className="flex items-center gap-2">
          <a
            href={`${API_URL}/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {SHORT_URL.replace(/^https?:\/\//, '')}/{id}
          </a>
          
          {/* Copy button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCopy(id);
            }}
            className="group/copy shrink-0 rounded-full transition-all duration-75 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700 active:bg-neutral-200 dark:active:bg-neutral-600 p-1.5"
            type="button"
          >
            <span className="sr-only">Copy short link</span>
            {copied ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-green-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            ) : (
              <svg
                fill="none"
                shapeRendering="geometricPrecision"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="h-4 w-4 text-neutral-600 dark:text-neutral-400"
              >
                <path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"></path>
              </svg>
            )}
          </button>
        </div>
        
        {description && (
          <a
            href={description}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-violet-700 dark:text-violet-400 hover:underline break-all mr-3 block"
          >
            {description}
          </a>
        )}
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          <CalendarIcon className="size-4 inline-block mr-1 -mt-1" />
          {formatDate(date)}
        </div>
      </div>
    </div>
  );
};

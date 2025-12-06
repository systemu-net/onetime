import { QrCode } from '@/types';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { HiArrowUturnRight } from "react-icons/hi2";
import { IoCopyOutline } from 'react-icons/io5';
import { API_URL, SHORT_URL } from '../../apis/config';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownShortcut,
} from '../elements/dropdown';
import { AnimatedShortTextIcon } from '../icons/AnimatedShortTextIcon';

type QrCodesListProps = {
  fetchQrCodes: () => Promise<void>;
  qrCodes: QrCode[];
};

export const QrCodesList: React.FC<QrCodesListProps> = ({
  qrCodes,
}) => {
  const [copied, setCopied] = useState<number | null>(null);
  const [modalQrCode, setModalQrCode] = useState<QrCode | null>(null);
  const [cookies] = useCookies(['email']);

  const handleCopy = (lookupCode: string, id: number) => {
    const shortUrl = `${API_URL}/${lookupCode}?r=qr`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(id);
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInHours < 48) {
      return '1d';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getTitle = (qrCode: QrCode) => {
    if (qrCode.link.title) return qrCode.link.title;
    return `Untitled ${formatDate(qrCode.created_at)}`;
  };

  return (
    <div className="w-full">
      <ul className="group/card-list w-full flex flex-col gap-2">
        {qrCodes.map((item) => {
          return (
            <li
              key={item.id}
              className="w-full group/card border rounded-xl transition-all hover:shadow-md overflow-hidden border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            >
              <div 
                onClick={() => setModalQrCode(item)}
                className="w-full flex items-center gap-3 sm:gap-5 px-4 py-2.5 text-sm text-left cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                {/* Left section - QR Code preview */}
                <div className="shrink-0">
                  <img
                    alt={getTitle(item)}
                    draggable="false"
                    loading="lazy"
                    width="80"
                    height="80"
                    className="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white"
                    src={item.image_url}
                  />
                </div>

                {/* Middle section - QR info */}
                <div className="min-w-0 grow">
                  {/* Short link with copy button */}
                  <div className="flex items-center gap-2 mb-1">
                    <a
                      href={`${API_URL}/${item.link.lookup_code}?r=qr`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="text-xs sm:text-sm hover:underline text-violet-600 dark:text-violet-400"
                    >
                      {SHORT_URL.replace(/^https?:\/\//, '')}/{item.link.lookup_code}
                    </a>
                    
                    {/* Copy button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCopy(item.link.lookup_code, item.id);
                      }}
                      className="group/copy rounded-full transition-all duration-75 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700 active:bg-neutral-200 dark:active:bg-neutral-600 p-1.5 relative z-10"
                      type="button"
                    >
                      <span className="sr-only">Copy short link</span>
                      {copied === item.id ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-3.5 h-3.5 text-green-600"
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
                          className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400"
                        >
                          <path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"></path>
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Destination URL */}
                  <div className="flex items-center gap-1 text-xs sm:text-sm mb-2">
                    <HiArrowUturnRight className="w-3 h-3 shrink-0 text-neutral-400 dark:text-neutral-500 scale-y-[-1]" />
                    <a
                      href={item.link.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="truncate text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer hover:underline"
                    >
                      {item.link.original_url}
                    </a>
                  </div>

                  {/* Bottom info row */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    {/* Created by */}
                    <div className="flex items-center gap-1.5">
                      <div className="size-4 rounded-full bg-violet-600 flex items-center justify-center text-white text-[10px] font-semibold">
                        {cookies.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span>Created by</span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {cookies.email}
                      </span>
                    </div>

                    {/* Date */}
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{formatDate(item.created_at)}</span>
                  </div>
                </div>

                {/* Right section - Actions */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {/* Scan statistics */}
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-violet-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {item.link.scans_count}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {item.link.scans_count === 1 ? 'scan' : 'scans'}
                    </span>
                  </div>

                  {/* More menu */}
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="relative z-50"
                  >
                    <Dropdown>
                      <DropdownButton
                        plain
                        aria-label="More options"
                        className="flex items-center justify-center rounded-md border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition-all h-8 px-1.5"
                      >
                        <EllipsisVerticalIcon className="w-5 h-5" />
                      </DropdownButton>
                      <DropdownMenu anchor="bottom end" className="z-50">
                        <DropdownItem onClick={() => handleDownload(item.image_url, `qr-${item.link.lookup_code}.png`)}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                            data-slot="icon"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                            />
                          </svg>
                          <DropdownLabel>Download</DropdownLabel>
                          <DropdownShortcut keys="D" />
                        </DropdownItem>

                        <DropdownItem onClick={() => handleCopy(item.link.lookup_code, item.id)}>
                          <IoCopyOutline data-slot="icon" />
                          <DropdownLabel>
                            {copied === item.id ? 'Copied!' : 'Copy Short Link'}
                          </DropdownLabel>
                          <DropdownShortcut keys="C" />
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      
      {/* End of list banner */}
      {qrCodes.length > 0 && (
        <div className="flex flex-col items-center justify-center py-8 mt-4">
          <div className="mb-3">
            <AnimatedShortTextIcon size={48} isAnimating={true} className="text-violet-600 dark:text-violet-500" />
          </div>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            You've reached the end of your QR codes
          </span>
        </div>
      )}

      {/* QR Code Modal */}
      {modalQrCode && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setModalQrCode(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setModalQrCode(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
            </button>

            {/* Modal content */}
            <div className="flex flex-col items-center">
              {/* QR Code Image - High Quality */}
              <div className="bg-white rounded-xl p-8 sm:p-10 shadow-lg mb-6 w-full">
                <img
                  src={modalQrCode.image_url}
                  alt={getTitle(modalQrCode)}
                  className="w-full mx-auto"
                  style={{ imageRendering: 'crisp-edges', maxWidth: '400px' }}
                />
              </div>

              {/* Short URL with favicon and copy button */}
              <div className="flex items-center gap-3 mb-6 w-full max-w-md">
                <div className="shrink-0">
                  <img
                    alt={new URL(modalQrCode.link.original_url).hostname}
                    draggable="false"
                    loading="lazy"
                    width="20"
                    height="20"
                    className="rounded-full size-5 border border-neutral-200 dark:border-neutral-600"
                    src={`https://www.google.com/s2/favicons?sz=64&domain_url=${new URL(modalQrCode.link.original_url).hostname}`}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-100 truncate">
                      {SHORT_URL.replace(/^https?:\/\//, '')}/{modalQrCode.link.lookup_code}?r=qr
                    </span>
                    <button
                      onClick={() => handleCopy(modalQrCode.link.lookup_code, modalQrCode.id)}
                      className="group/copy rounded-full transition-all duration-75 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700 active:bg-neutral-200 dark:active:bg-neutral-600 p-1.5 relative z-10"
                      type="button"
                    >
                      <span className="sr-only">Copy</span>
                      {copied === modalQrCode.id ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-3.5 h-3.5 text-green-600"
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
                          className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400"
                        >
                          <path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm">
                    <HiArrowUturnRight className="w-3 h-3 shrink-0 text-neutral-400 dark:text-neutral-500 scale-y-[-1]" />
                    <a
                      href={modalQrCode.link.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer hover:underline"
                    >
                      {modalQrCode.link.original_url}
                    </a>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleDownload(modalQrCode.image_url, `qr-${modalQrCode.link.lookup_code}.png`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => handleCopy(modalQrCode.link.lookup_code, modalQrCode.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium transition-colors"
                >
                  {copied === modalQrCode.id ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-green-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <IoCopyOutline className="w-5 h-5" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

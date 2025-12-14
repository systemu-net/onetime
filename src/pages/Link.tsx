import MainLayout from '@/components/layouts/MainLayout';
import { LINKS_ROUTE } from '@/routes';

import { getLink } from '@/apis/shorten';
import Box from '@/components/Box';
import { ItemDetails } from '@/components/elements/ItemDetails';
import { extractDomain } from '@/utils/transformers';
import { ChevronLeftIcon } from '@heroicons/react/16/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { HiArrowUturnRight } from "react-icons/hi2";
import { IoCopyOutline } from 'react-icons/io5';
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';


import { API_URL, SHORT_URL } from '@/apis/config';
import { createQrCode, getQrCodes } from '@/apis/qr_codes';
import LinkStatsComponent from '@/components/LinkStatsComponent';
import { useNotification } from '@/Notifications';
import { Link, QrCode } from '@/types';

const LinkPage = () => {
  const { lookup_code } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [cookies] = useCookies(['token', 'email']);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { addNotification } = useNotification();

  const [link, setLink] = useState<Link | null>(null);
  const [modalQrCode, setModalQrCode] = useState<QrCode | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<QrCode | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const fetchLink = async () => {
      try {
        const link: Link = await getLink(cookies.token, lookup_code);
        setLink(link);
      } catch (error: unknown) {
        console.error(error);
        setErrorMessage('An error occurred while fetching link data.');
      }
    };

    if (cookies.token && lookup_code) {
      fetchLink();
    }
  }, [cookies.token, lookup_code]);

  // Fetch QR code for preview
  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const qrCodes: QrCode[] = await getQrCodes(cookies.token);
        const linkQrCode = qrCodes.find(qr => qr.link.lookup_code === lookup_code);
        if (linkQrCode) {
          setQrCodePreview(linkQrCode);
        }
      } catch (err) {
        console.error('Error fetching QR code:', err);
      }
    };

    if (cookies.token && lookup_code) {
      fetchQrCode();
    }
  }, [cookies.token, lookup_code]);

  // Check if we should show QR modal based on URL params
  useEffect(() => {
    const showQr = searchParams.get('qr');
    
    const fetchQrCode = async () => {
      if (showQr === 'true' && cookies.token && lookup_code) {
        try {
          const qrCodes: QrCode[] = await getQrCodes(cookies.token);
          const existingQrCode = qrCodes.find(qr => qr.link.lookup_code === lookup_code);

          if (existingQrCode) {
            setModalQrCode(existingQrCode);
          } else if (link) {
            // Create QR code if it doesn't exist
            const newQrCode = await createQrCode(cookies.token, {
              qr_code: {
                lookup_code: lookup_code,
                title: extractDomain(link.original_url),
              },
            });
            setModalQrCode(newQrCode.qr_code);
            addNotification('QR Code created', 'success');
          }
        } catch (error: unknown) {
          console.error(error);
          addNotification('Failed to load QR code', 'error');
        }
      }
    };

    fetchQrCode();
  }, [searchParams, cookies.token, lookup_code, link, addNotification]);

  const handleCopy = (lookupCode: string) => {
    const shortUrl = `${API_URL}/${lookupCode}?r=qr`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
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

  const getTitle = (qrCode: QrCode) => {
    if (qrCode.link.title) return qrCode.link.title;
    const date = new Date(qrCode.created_at);
    const diffInHours = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `Untitled ${diffInHours}h`;
    } else if (diffInHours < 48) {
      return 'Untitled 1d';
    } else {
      return `Untitled ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
  };

  return (
    <MainLayout>
      <div className="max-lg:hidden mb-3">
        <RouterLink
          to={LINKS_ROUTE}
          className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400"
        >
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Links
        </RouterLink>
      </div>
      <Box>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Link Details */}
          <div className="lg:col-span-2">
            {link && (
              <ItemDetails
                title={extractDomain(link.original_url)}
                description={link.original_url}
                id={link.lookup_code}
                date={link.created_at}
                link={false}
              />
            )}
          </div>

          {/* QR Code Preview */}
          <div className="flex flex-col items-center lg:items-end justify-start">
              {qrCodePreview ? (
                  <button
                    onClick={() => {
                      const showQrParam = new URLSearchParams(window.location.search);
                      showQrParam.set('qr', 'true');
                      navigate(`/links/${lookup_code}?${showQrParam.toString()}`);
                    }}
                    className="bg-white rounded-lg p-3 border border-zinc-200 dark:border-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-500 transition-all hover:shadow-md cursor-pointer"
                  >
                    <img
                      src={qrCodePreview.image_url}
                      alt="QR Code"
                      className="w-32 h-32"
                      style={{ imageRendering: 'crisp-edges' }}
                    />
                  </button>
              ) : (
                  <button
                    onClick={() => {
                      const showQrParam = new URLSearchParams(window.location.search);
                      showQrParam.set('qr', 'true');
                      navigate(`/links/${lookup_code}?${showQrParam.toString()}`);
                    }}
                    className="bg-zinc-100 dark:bg-zinc-700 rounded-lg p-3 w-32 h-32 flex flex-col items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors cursor-pointer group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1}
                      stroke="currentColor"
                      className="w-12 h-12 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400 dark:group-hover:text-zinc-500"
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
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Create QR</span>
                  </button>
              )}
          </div>
        </div>
      </Box>

      {/* Statistics Section */}
      {link && (
        <Box>
          <LinkStatsComponent link={link} />
        </Box>
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
              onClick={() => {
                setModalQrCode(null);
                // Remove qr param from URL
                navigate(`/links/${lookup_code}`, { replace: true });
              }}
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
                      onClick={() => handleCopy(modalQrCode.link.lookup_code)}
                      className="group/copy rounded-full transition-all duration-75 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700 active:bg-neutral-200 dark:active:bg-neutral-600 p-1.5 relative z-10"
                      type="button"
                    >
                      <span className="sr-only">Copy</span>
                      {copied ? (
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
                  onClick={() => handleCopy(modalQrCode.link.lookup_code)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium transition-colors"
                >
                  {copied ? (
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
    </MainLayout>
  );
};
export default LinkPage;

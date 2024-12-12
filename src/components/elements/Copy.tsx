import { useState } from 'react';
import { API_URL } from '../../apis/config';

export const CopyUrl = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = (shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <button className="bg-accent text-primary rounded-full font-bold w-24 h-10" datatype="wide" onClick={() => handleCopy(`${API_URL}/${code}`)}>
      <span className="">{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
};

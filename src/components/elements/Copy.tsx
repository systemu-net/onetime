import { useState } from 'react';
import { API_URL } from '../../apis/config';
import { Button } from './button';

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
    <Button color='teal' onClick={() => handleCopy(`${API_URL}/ ${code}`)}>
      <span className="">{copied ? 'Copied!' : 'Copy'}</span>
    </Button>
  );
};

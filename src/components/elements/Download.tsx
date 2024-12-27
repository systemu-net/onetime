import { Button } from './button';

export const DownloadUrl = ({ fileUrl }: { fileUrl: string }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl, { method: 'GET' });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileUrl.split('/').pop() || 'image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Button onClick={handleDownload} className='cursor-pointer'>
      Download
    </Button>
  );
};

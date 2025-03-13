import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';

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
    <button
      title="Download"
      onClick={handleDownload}
      className="antialiased rounded-full font-bold w-7 h-7 hover:scale-105"
    >
      <ArrowDownTrayIcon fontSize={24} />
    </button>
  );
};

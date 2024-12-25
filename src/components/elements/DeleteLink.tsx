import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { deleteLink } from '../../apis/shorten';

export const DeleteLink = ({ lookup_code, fetchLinks }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [cookies] = useCookies(['token']);

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

  return (
    <button
      className="bg-red-500 text-white antialiased text-primary rounded-full font-bold w-7 h-7"
      datatype="wide"
      disabled={loading}
      onClick={() => handleDelete(lookup_code)}
    >
      <span className="">X</span>
    </button>
  );
};

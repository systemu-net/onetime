import { useState } from 'react';
import {deleteLink} from '../../apis/shorten';
import {LOGIN_ROUTE} from '../../routes';
import {useCookies} from 'react-cookie';
import {useNavigate} from 'react-router-dom';

export const DeleteLink = ({ lookup_code, fetchLinks }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const navigate = useNavigate();

  const handleDelete = async (lookup_code: string) => {
    if (!cookies.token) {
      return navigate(LOGIN_ROUTE);
    }

    try {
      setLoading(true);

      const [response, error] = await deleteLink(cookies.token, lookup_code);

      if (error) {
        setLoading(false);
      } else {
        if (response.ok) {
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
      className="bg-accent text-primary rounded-full font-bold w-24 h-10"
      datatype="wide"
      disabled={loading}
      onClick={() => handleDelete(lookup_code)}
    >
      <span className="">{loading ? 'Deleting...' : 'Delete'}</span>
    </button>
  );
};

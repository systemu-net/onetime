import { getCurrentUserApi } from "@/apis/authentication";
import { useCookies } from 'react-cookie';
import { LOGIN_ROUTE } from '../routes';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type ProtectedRouteProps = {
  children: JSX.Element;
  allowedRoles: ('admin' | 'staff')[]; // set the user-roles
};

interface UserInfo {
  id: number;
  email: string;
  role: 'admin' | 'staff';
  created_at: string;
  updated_at: string;
}


const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const [cookies, , removeCookie] = useCookies(['token']);
  const [user, setUser] = useState<UserInfo>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const [response, error] = await getCurrentUserApi(cookies.token);

        if (error) {
          console.error(error);
          removeCookie('token');
        } else {
          // @ts-expect-error: response might not have a json method
          const data = await response.json();
          // @ts-expect-error: response might not have a json method
          if (response.ok) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (!cookies.token) {
      navigate(LOGIN_ROUTE);
    } else {
      fetchUser();
    }
  }, [cookies.token, navigate, removeCookie]);

  return (
    <>
      {user && allowedRoles.includes(user.role) ? children : <h1> Error 404 -- Page Not Found </h1>}
    </>
  );
};

export default ProtectedRoute;

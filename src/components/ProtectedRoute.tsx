import {useCookies} from 'react-cookie';
import {LOGIN_ROUTE} from '../routes';
import {getCurrentUserApi} from '../apis/authentication';

import React, { useEffect, useState } from 'react';
import {Navigate, useNavigate} from 'react-router-dom';

type ProtectedRouteProps = {
  children: JSX.Element;
  allowedRoles: ('admin' | 'staff')[]; // set the user-roles
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({children, allowedRoles}) => {
  const [cookies] = useCookies(['token']);
  const [user, setUser] = useState<UserInfo>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!cookies.token) {
      navigate(LOGIN_ROUTE);
    }

    const fetchUser = async () => {
      try {
        const [response, error] = await getCurrentUserApi(cookies.token);

        if (error) {
          console.error(error);
        } else {
          const data = await response.json();

          if (response.ok) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();

  }, []);

  if (allowedRoles.includes(user.role)) {
    return children;
  } else {
    return (
      <>
        <div className="error-page-container">
          <h1> Error 404 -- Page Not Found </h1>
        </div>
      </>
    );
  }

  return children;
};

export default ProtectedRoute;

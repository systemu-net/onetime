import {useCookies} from 'react-cookie';
import {LOGIN_ROUTE} from '../routes';

import React from 'react';
import {Navigate} from 'react-router-dom';

type ProtectedRouteProps = {
  children: JSX.Element;
  allowedRoles: ('admin' | 'staff')[]; // set the user-roles
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const [cookies] = useCookies(['token']);
  const userRole = 'admin';
  if (!cookies.token) {
    return <Navigate to={LOGIN_ROUTE} />;
  } else if (!allowedRoles.includes(userRole!)) {
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

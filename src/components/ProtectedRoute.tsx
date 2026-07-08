import { getCurrentUserApi } from "@/apis/authentication";
import { useCookies } from 'react-cookie';
import { LOGIN_ROUTE } from '../routes';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type ProtectedRouteProps = {
  children: JSX.Element;
  // Restrict to specific roles. OMIT to allow any authenticated user — the default for a
  // user's own pages, since every account is a `member` by default. Reserve an explicit
  // list (e.g. ["admin"]) for a genuinely admin-only surface.
  allowedRoles?: ('admin' | 'staff' | 'member')[];
};

interface UserInfo {
  id: number;
  email: string;
  role: 'admin' | 'staff' | 'member';
  created_at: string;
  updated_at: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const [cookies, setCookie, removeCookie] = useCookies(['token', 'email', 'plan']);
  const [user, setUser] = useState<UserInfo | null>(null); // Explicitly allow null for initial state
  const [loading, setLoading] = useState(true); // Loading state to avoid showing error prematurely
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const [response, error] = await getCurrentUserApi(cookies.token);

        if (error) {
          console.error('Error fetching user:', error);
          removeCookie('token');
          navigate(LOGIN_ROUTE); // Redirect to login if there's an error
        } else if (response) {
          // @ts-expect-error: response might not have a json method
          const data = await response.json();
          setUser(data.user);
          setCookie('email', data.user.email);
          setCookie('plan', data.user.plan);
        } else {
          console.error('Unexpected response structure');
          removeCookie('token');
          navigate(LOGIN_ROUTE);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        removeCookie('token');
        navigate(LOGIN_ROUTE);
      } finally {
        setLoading(false);
      }
    };

    if (!cookies.token) {
      navigate(LOGIN_ROUTE);
    } else {
      fetchUser();
    }
  }, [cookies.token, navigate, removeCookie, setCookie]);

  if (loading) {
    return ''; // Loading state while fetching user info
  }

  // Unauthenticated users were already redirected to login by the effect above; this is a
  // fallback. An authenticated user passes when the route names no roles, or names one it holds.
  if (!user) {
    return <h1>Error 404 -- Page Not Found</h1>;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <h1>Error 404 -- Page Not Found</h1>;
  }
  return children;
};

export default ProtectedRoute;

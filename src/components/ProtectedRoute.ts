import {Navigate, useLocation} from 'react-router-dom'

const ProtectedRoute = ({children}) => {
  const location = useLocation()
  //   const {token} = useAuth()

  if (!token) {
    return <Navigate to={LOGIN_PATH} replace state={{from: location}} />
  }

  return children
}
export default ProtectedRoute

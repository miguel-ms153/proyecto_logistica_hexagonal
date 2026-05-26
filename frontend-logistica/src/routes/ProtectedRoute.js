import {
  Navigate
} from 'react-router-dom';

function ProtectedRoute({

  children,

  roles = []

}) {

  const token =
    localStorage.getItem(
      'token'
    );

  const usuario =
    JSON.parse(

      localStorage.getItem(
        'usuario'
      )

    );

  // SIN TOKEN

  if (!token) {

    return (
      <Navigate to="/" />
    );

  }

  // VALIDAR ROLES

  if (

    roles.length > 0 &&

    !roles.includes(
      usuario?.rol
    )

  ) {

    return (
      <Navigate
        to="/dashboard"
      />
    );

  }

  return children;

}

export default ProtectedRoute;
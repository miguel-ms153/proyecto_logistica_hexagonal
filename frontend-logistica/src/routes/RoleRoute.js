import {
  Navigate
} from 'react-router-dom';

function RoleRoute({
  children,
  roles
}) {

  const usuario =
    JSON.parse(
      localStorage.getItem('usuario')
    );

  // NO LOGIN

  if (!usuario) {

    return (
      <Navigate to="/" />
    );

  }

  // SIN PERMISO

  if (
    !roles.includes(
      usuario.rol
    )
  ) {

    return (
      <Navigate
        to="/dashboard"
      />
    );

  }

  // PERMITIDO

  return children;

}

export default RoleRoute;
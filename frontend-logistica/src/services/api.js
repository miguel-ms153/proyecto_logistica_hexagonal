import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3001'
});

// TOKEN AUTOMÁTICO
API.interceptors.request.use((config) => {

  const token =
  localStorage.getItem('token');

  if (token) {

    config.headers.Authorization =
    `Bearer ${token}`;

  }

  const usuario =
  JSON.parse(
    localStorage.getItem('usuario')
    || '{}'
  );

  if (usuario?.nombre) {

    config.headers['x-usuario-nombre'] =
    encodeURIComponent(usuario.nombre);

    config.headers['x-usuario-email'] =
    encodeURIComponent(usuario.email || '');

    config.headers['x-usuario-rol'] =
    encodeURIComponent(usuario.rol || '');

  }

  return config;

});

export default API;

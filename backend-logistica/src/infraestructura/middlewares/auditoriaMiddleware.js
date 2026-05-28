const Bitacora =
require('../models/BitacoraModel');

const metodosAuditables = [
  'POST',
  'PUT',
  'DELETE'
];

const rutasExcluidas = [
  '/bitacora',
  '/dashboard',
  '/auth',
  '/usuarios/login'
];

function auditoriaMiddleware(req, res, next) {

  if (
    !metodosAuditables.includes(req.method) ||
    rutasExcluidas.some((ruta) => req.originalUrl.startsWith(ruta))
  ) {

    next();
    return;

  }

  const jsonOriginal = res.json.bind(res);

  res.json = (body) => {

    registrarAuditoria(req, res, body);

    return jsonOriginal(body);

  };

  next();

}

async function registrarAuditoria(req, res, body) {

  try {

    if (res.statusCode >= 400) return;

    const modulo =
      obtenerModulo(req.originalUrl);

    const accion =
      obtenerAccion(req.method);

    const usuario =
      decodeURIComponent(
        req.headers['x-usuario-nombre'] || 'Sistema'
      );

    const email =
      decodeURIComponent(
        req.headers['x-usuario-email'] || ''
      );

    const rol =
      decodeURIComponent(
        req.headers['x-usuario-rol'] || 'SIN ROL'
      );

    const idRecurso =
      obtenerIdRecurso(req, body);

    await Bitacora.create({
      usuario,
      email,
      rol,
      accion,
      modulo,
      detalle:
        `${usuario} ${accion.toLowerCase()} registro en ${modulo}${idRecurso ? ` #${idRecurso}` : ''}`,
      metodo: req.method,
      ruta: req.originalUrl,
      estado_http: res.statusCode
    });

  } catch (error) {

    console.log(
      'Error registrando auditoria:',
      error.message
    );

  }

}

function obtenerModulo(url) {

  const modulo =
    url.split('/')[1] || 'sistema';

  return modulo
    .replace('-', ' ')
    .toUpperCase();

}

function obtenerAccion(method) {

  if (method === 'POST') return 'CREAR';
  if (method === 'PUT') return 'EDITAR';
  if (method === 'DELETE') return 'ELIMINAR';

  return method;

}

function obtenerIdRecurso(req, body) {

  const partes =
    req.originalUrl.split('/');

  const idUrl =
    partes.find((parte) => /^\d+$/.test(parte));

  if (idUrl) return idUrl;

  if (!body || typeof body !== 'object') return null;

  return (
    body.id_usuario ||
    body.id_producto ||
    body.id_orden ||
    body.id_pago ||
    body.id_embarque ||
    body.id_aduana ||
    body.id_documento ||
    body.id_detalle ||
    null
  );

}

module.exports =
auditoriaMiddleware;

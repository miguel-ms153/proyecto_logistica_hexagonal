const Usuario = require('../models/UsuarioModel');
const Orden = require('../models/OrdenModel');
const Producto = require('../models/ProductoModel');
const Proveedor = require('../models/ProveedorModel');
const Pago = require('../models/PagoModel');
const Embarque = require('../models/EmbarqueModel');
const DetalleOrden = require('../models/DetalleOrdenModel');
const Aduana = require('../models/AduanaModel');
const Documento = require('../models/DocumentoModel');
const Bitacora = require('../models/BitacoraModel');

// =========================
// USUARIO - ORDEN
// =========================

Usuario.hasMany(Orden, {
  foreignKey: 'id_usuario',
  as: 'ordenes'
});

Orden.belongsTo(Usuario, {
  foreignKey: 'id_usuario',
  as: 'usuario'
});

// =========================
// PROVEEDOR - PRODUCTO
// =========================

Proveedor.hasMany(Producto, {
  foreignKey: 'id_proveedor',
  as: 'productos'
});

Producto.belongsTo(Proveedor, {
  foreignKey: 'id_proveedor',
  as: 'proveedor'
});

// =========================
// ORDEN - PAGO
// =========================

Orden.hasMany(Pago, {
  foreignKey: 'id_orden',
  as: 'pagos'
});

Pago.belongsTo(Orden, {
  foreignKey: 'id_orden',
  as: 'orden'
});

// =========================
// ORDEN - EMBARQUE
// =========================

Orden.hasMany(Embarque, {
  foreignKey: 'id_orden',
  as: 'embarques'
});

Embarque.belongsTo(Orden, {
  foreignKey: 'id_orden',
  as: 'orden'
});

// =========================
// ORDEN - PRODUCTO
// =========================

Orden.belongsToMany(Producto, {
  through: DetalleOrden,
  foreignKey: 'id_orden',
  otherKey: 'id_producto',
  as: 'productos'
});

Producto.belongsToMany(Orden, {
  through: DetalleOrden,
  foreignKey: 'id_producto',
  otherKey: 'id_orden',
  as: 'ordenes'
});
DetalleOrden.belongsTo(Producto, {
  foreignKey: 'id_producto',
  as: 'producto'
});

Producto.hasMany(DetalleOrden, {
  foreignKey: 'id_producto',
  as: 'detalles'
});

// =========================
// ORDEN - ADUANA
// =========================

Orden.hasMany(Aduana, {
  foreignKey: 'id_orden',
  as: 'aduanas'
});

Aduana.belongsTo(Orden, {
  foreignKey: 'id_orden',
  as: 'orden'
});

// =========================
// DOCUMENTOS
// =========================

Orden.hasMany(Documento, {
  foreignKey: 'id_orden',
  as: 'documentos'
});

Documento.belongsTo(Orden, {
  foreignKey: 'id_orden',
  as: 'orden'
});

Aduana.hasMany(Documento, {
  foreignKey: 'id_aduana',
  as: 'documentos'
});

Documento.belongsTo(Aduana, {
  foreignKey: 'id_aduana',
  as: 'aduana'
});

module.exports = {
  Usuario,
  Orden,
  Producto,
  Proveedor,
  Pago,
  Embarque,
  DetalleOrden,
  Aduana,
  Documento,
  Bitacora
};

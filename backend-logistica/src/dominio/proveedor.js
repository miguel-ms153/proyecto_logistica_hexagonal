class Proveedor {

  constructor({
    id_proveedor,
    nombre,
    telefono,
    direccion
  }) {

    this.id_proveedor = id_proveedor;
    this.nombre = nombre;
    this.telefono = telefono;
    this.direccion = direccion;

  }

}

module.exports = Proveedor;
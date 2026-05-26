class Usuario {

  constructor({
    id_usuario,
    nombre,
    email,
    password
  }) {

    this.id_usuario = id_usuario;
    this.nombre = nombre;
    this.email = email;
    this.password = password;

  }

}

module.exports = Usuario;
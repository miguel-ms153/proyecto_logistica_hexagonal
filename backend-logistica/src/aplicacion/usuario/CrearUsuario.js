const bcrypt = require('bcryptjs');

class CrearUsuario {

  constructor(repository) {
    this.repository = repository;
  }

  async ejecutar(data) {

    data.password =
      await bcrypt.hash(
        data.password,
        10
      );

    if (!data.rol) {
      data.rol = 'OPERADOR';
    }

    return await this.repository.crear(data);

  }

}

module.exports = CrearUsuario;
const bcrypt = require('bcryptjs');

class EditarUsuario {

  constructor(repository) {
    this.repository = repository;
  }

  async ejecutar(id, data) {
    if (data.password) {
      data.password =
        await bcrypt.hash(
          data.password,
          10
        );
    }

    return await this.repository.editar(id, data);
  }

}

module.exports = EditarUsuario;

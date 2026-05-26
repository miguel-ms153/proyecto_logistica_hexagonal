class EditarProducto {
  constructor(repository) {
    this.repository = repository;
  }

  async ejecutar(id, data) {
    return await this.repository.editar(id, data);
  }
}

module.exports = EditarProducto;
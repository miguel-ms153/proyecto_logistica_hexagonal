class ObtenerBitacora {

  constructor(repository) {
    this.repository = repository;
  }

  async ejecutar() {
    return await this.repository.obtenerTodos();
  }

}

module.exports = ObtenerBitacora;

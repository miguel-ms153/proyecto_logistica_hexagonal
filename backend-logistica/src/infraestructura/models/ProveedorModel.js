const { DataTypes } = require('sequelize');

const sequelize =
require('../database/mysql');

const Proveedor = sequelize.define(
  'proveedor',
  {
    id_proveedor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    nombre: {
      type: DataTypes.STRING
    },

    telefono: {
      type: DataTypes.STRING
    },

    direccion: {
      type: DataTypes.STRING
    }
  },
  {
    timestamps: false
  }
);

module.exports = Proveedor;
const { DataTypes } = require('sequelize');

const sequelize =
require('../database/mysql');

const Orden = sequelize.define(
  'orden',
  {
    id_orden: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },

    estado: {
      type: DataTypes.STRING
    },

    id_usuario: {
      type: DataTypes.INTEGER
    }
  },
  {
    timestamps: false
  }
);

module.exports = Orden;
const {
  DataTypes
} = require('sequelize');

const sequelize =
require('../database/mysql');

const HistorialLogin =
sequelize.define(
  'HistorialLogin',
  {
    id_historial: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    id_usuario: DataTypes.INTEGER,

    email: DataTypes.STRING,

    rol: DataTypes.STRING,

    estado: DataTypes.STRING,

    fecha: DataTypes.DATE
  },
  {
    tableName: 'historial_login',
    timestamps: false
  }
);

module.exports = HistorialLogin;
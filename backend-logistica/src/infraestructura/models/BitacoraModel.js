const { DataTypes } = require('sequelize');

const sequelize =
require('../database/mysql');

const Bitacora = sequelize.define(
  'bitacora',
  {
    id_bitacora: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    usuario: {
      type: DataTypes.STRING,
      defaultValue: 'Sistema'
    },

    email: {
      type: DataTypes.STRING
    },

    rol: {
      type: DataTypes.STRING,
      defaultValue: 'SIN ROL'
    },

    accion: {
      type: DataTypes.STRING,
      allowNull: false
    },

    modulo: {
      type: DataTypes.STRING,
      allowNull: false
    },

    detalle: {
      type: DataTypes.TEXT
    },

    metodo: {
      type: DataTypes.STRING
    },

    ruta: {
      type: DataTypes.STRING
    },

    estado_http: {
      type: DataTypes.INTEGER
    },

    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'bitacora',
    timestamps: false
  }
);

module.exports = Bitacora;

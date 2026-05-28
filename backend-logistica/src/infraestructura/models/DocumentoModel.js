const { DataTypes } = require('sequelize');

const sequelize =
require('../database/mysql');

const Documento = sequelize.define(
  'documento',
  {
    id_documento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },

    tipo: {
      type: DataTypes.STRING,
      allowNull: false
    },

    estado: {
      type: DataTypes.STRING,
      defaultValue: 'Pendiente'
    },

    fecha_emision: {
      type: DataTypes.DATE
    },

    fecha_vencimiento: {
      type: DataTypes.DATE
    },

    observaciones: {
      type: DataTypes.TEXT
    },

    archivo_original: {
      type: DataTypes.STRING
    },

    archivo_nombre: {
      type: DataTypes.STRING
    },

    archivo_ruta: {
      type: DataTypes.STRING
    },

    archivo_mime: {
      type: DataTypes.STRING
    },

    archivo_tamano: {
      type: DataTypes.INTEGER
    },

    id_orden: {
      type: DataTypes.INTEGER
    },

    id_aduana: {
      type: DataTypes.INTEGER
    }
  },
  {
    tableName: 'documentos',
    timestamps: false
  }
);

module.exports = Documento;

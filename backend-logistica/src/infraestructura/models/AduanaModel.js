const { DataTypes } = require('sequelize');

const sequelize =
require('../database/mysql');

const Aduana = sequelize.define(
  'aduana',
  {
    id_aduana: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    numero_declaracion: {
      type: DataTypes.STRING
    },

    regimen: {
      type: DataTypes.STRING,
      defaultValue: 'Importacion a consumo'
    },

    partida_arancelaria: {
      type: DataTypes.STRING
    },

    agente_aduanero: {
      type: DataTypes.STRING
    },

    estado: {
      type: DataTypes.STRING,
      defaultValue: 'Pendiente'
    },

    documentos_pendientes: {
      type: DataTypes.STRING,
      defaultValue: ''
    },

    observaciones: {
      type: DataTypes.TEXT
    },

    fecha_ingreso: {
      type: DataTypes.DATE
    },

    fecha_nacionalizacion: {
      type: DataTypes.DATE
    },

    id_orden: {
      type: DataTypes.INTEGER
    }
  },
  {
    tableName: 'aduanas',
    timestamps: false
  }
);

module.exports = Aduana;

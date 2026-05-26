const { DataTypes } = require('sequelize');
const sequelize = require('../database/mysql');

const PagoModel = sequelize.define('Pago', {
  id_pago: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  monto: {
    type: DataTypes.FLOAT,
    allowNull: false
  },

  metodo: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Transferencia'
  },

  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pendiente'
  },

  fecha: {
    type: DataTypes.DATE,
    allowNull: false
  },

  id_orden: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'pago',
  timestamps: false
});

module.exports = PagoModel;
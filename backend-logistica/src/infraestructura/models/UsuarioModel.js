const {
  DataTypes
} = require('sequelize');

const sequelize =
require('../database/mysql');

const UsuarioModel =
sequelize.define(

  'Usuario',

  {

    id_usuario: {

      type:
        DataTypes.INTEGER,

      autoIncrement: true,

      primaryKey: true

    },

    nombre: {

      type:
        DataTypes.STRING,

      allowNull: false

    },

    email: {

      type:
        DataTypes.STRING,

      allowNull: false,

      unique: true

    },

    password: {

      type:
        DataTypes.STRING,

      allowNull: false

    },

    rol: {

      type:
        DataTypes.STRING,

      defaultValue:
        'OPERADOR'

    }

  },

  {

    tableName:
      'usuario',

    timestamps: false

  }

);

module.exports =
UsuarioModel;
require('dotenv').config();
require('./infraestructura/database/relaciones');

const express = require('express');
const cors = require('cors');
const http = require('http');

const { Server } = require('socket.io');

const sequelize = require('./infraestructura/database/mysql');
const conectarMongo = require('./infraestructura/database/mongo');
const auditoriaMiddleware = require('./infraestructura/middlewares/auditoriaMiddleware');

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

app.set('io', io);

app.use(cors());
app.use(express.json());
app.use(auditoriaMiddleware);

app.use('/usuarios', require('./infraestructura/routes/usuarioRoutes'));
app.use('/tracking', require('./infraestructura/routes/trackingRoutes'));
app.use('/dashboard', require('./infraestructura/routes/dashboardRoutes'));
app.use('/embarques', require('./infraestructura/routes/embarqueRoutes'));
app.use('/productos', require('./infraestructura/routes/productoRoutes'));
app.use('/ordenes', require('./infraestructura/routes/ordenRoutes'));
app.use('/proveedores', require('./infraestructura/routes/proveedorRoutes'));
app.use('/pagos', require('./infraestructura/routes/pagoRoutes'));
app.use('/aduanas', require('./infraestructura/routes/aduanaRoutes'));
app.use('/documentos', require('./infraestructura/routes/documentoRoutes'));
app.use('/bitacora', require('./infraestructura/routes/bitacoraRoutes'));
app.use('/auth', require('./infraestructura/routes/authRoutes'));
app.use(
  '/detalle-orden',
  require('./infraestructura/routes/detalleOrdenRoutes')
);

const iniciarServidor = async () => {
  try {
    await conectarMongo();

    await sequelize.sync();

    console.log('MySQL listo');

    server.listen(process.env.PORT, () => {
      console.log('Servidor corriendo en puerto', process.env.PORT);
    });
  } catch (error) {
    console.log('Error iniciando servidor:', error.message);
  }
};

iniciarServidor();

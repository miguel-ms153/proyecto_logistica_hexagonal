import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

import Login from './pages/Login';

import Dashboard from './pages/Dashboard';

import Usuarios from './pages/Usuarios';

import Productos from './pages/Productos';

import Ordenes from './pages/Ordenes';

import OrdenCompleta from './pages/OrdenCompleta';

import Embarques from './pages/Embarques';

import Proveedores from './pages/Proveedores';

import Pagos from './pages/Pagos';

import Aduanas from './pages/Aduanas';

import Documentos from './pages/Documentos';

import Trazabilidad from './pages/Trazabilidad';

import Reportes from './pages/Reportes';

import Bitacora from './pages/Bitacora';

import Notificaciones from './pages/Notificaciones';

import Tracking from './pages/Tracking';

import ProtectedRoute from './routes/ProtectedRoute';

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* USUARIOS */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <Usuarios />
            </ProtectedRoute>
          }
        />

        {/* PRODUCTOS */}
        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <Productos />
            </ProtectedRoute>
          }
        />

        {/* ORDENES */}
        <Route
          path="/ordenes"
          element={
            <ProtectedRoute>
              <Ordenes />
            </ProtectedRoute>
          }
        />

        {/* ORDEN COMPLETA */}
        <Route
          path="/orden-completa"
          element={
            <ProtectedRoute>
              <OrdenCompleta />
            </ProtectedRoute>
          }
        />

        {/* EMBARQUES */}
        <Route
          path="/embarques"
          element={
            <ProtectedRoute>
              <Embarques />
            </ProtectedRoute>
          }
        />

        {/* PROVEEDORES */}
        <Route
          path="/proveedores"
          element={
            <ProtectedRoute>
              <Proveedores />
            </ProtectedRoute>
          }
        />

        {/* PAGOS */}
        <Route
          path="/pagos"
          element={
            <ProtectedRoute>
              <Pagos />
            </ProtectedRoute>
          }
        />

        {/* ADUANAS */}
        <Route
          path="/aduanas"
          element={
            <ProtectedRoute>
              <Aduanas />
            </ProtectedRoute>
          }
        />

        {/* DOCUMENTOS */}
        <Route
          path="/documentos"
          element={
            <ProtectedRoute>
              <Documentos />
            </ProtectedRoute>
          }
        />

        {/* TRAZABILIDAD */}
        <Route
          path="/trazabilidad"
          element={
            <ProtectedRoute>
              <Trazabilidad />
            </ProtectedRoute>
          }
        />

        {/* REPORTES */}
        <Route
          path="/reportes"
          element={
            <ProtectedRoute>
              <Reportes />
            </ProtectedRoute>
          }
        />

        {/* BITACORA */}
        <Route
          path="/bitacora"
          element={
            <ProtectedRoute>
              <Bitacora />
            </ProtectedRoute>
          }
        />

        {/* NOTIFICACIONES */}
        <Route
          path="/notificaciones"
          element={
            <ProtectedRoute>
              <Notificaciones />
            </ProtectedRoute>
          }
        />

        {/* TRACKING */}
        <Route
          path="/tracking"
          element={
            <ProtectedRoute>
              <Tracking />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;

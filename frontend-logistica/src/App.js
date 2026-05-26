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

import Embarques from './pages/Embarques';

import Proveedores from './pages/Proveedores';

import Pagos from './pages/Pagos';

import Tracking from './pages/Tracking';

import ProtectedRoute from './routes/ProtectedRoute';

import RoleRoute
from './routes/RoleRoute';

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
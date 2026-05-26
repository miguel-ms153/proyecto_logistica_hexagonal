import { useEffect, useState } from 'react';

import API from '../services/api';

import Sidebar from '../components/Sidebar';

import { exportarExcel } from '../utils/exportExcel';
import { exportarPDF } from '../utils/exportPDF';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('OPERADOR');

  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [cargando, setCargando] = useState(false);

  const limpiarFormulario = () => {
    setNombre('');
    setEmail('');
    setPassword('');
    setRol('OPERADOR');
    setEditando(false);
    setIdEditando(null);
  };

  const obtenerUsuarios = async () => {
    try {
      setCargando(true);

      const res = await API.get('/usuarios');

      setUsuarios(res.data);
    } catch (error) {
      console.log(error);
      alert('Error al obtener usuarios');
    } finally {
      setCargando(false);
    }
  };

  const guardarUsuario = async () => {
    if (!nombre.trim() || !email.trim()) {
      alert('Nombre y email son obligatorios');
      return;
    }

    if (!editando && !password.trim()) {
      alert('La contraseña es obligatoria');
      return;
    }

    try {
      const usuario = {
        nombre,
        email,
        rol
      };

      if (password.trim()) {
        usuario.password = password;
      }

      if (editando) {
        await API.put(`/usuarios/${idEditando}`, usuario);
        alert('Usuario actualizado');
      } else {
        await API.post('/usuarios', usuario);
        alert('Usuario creado');
      }

      limpiarFormulario();
      obtenerUsuarios();
    } catch (error) {
      console.log(error);
      alert(editando ? 'Error al actualizar usuario' : 'Error al crear usuario');
    }
  };

  const cargarUsuarioParaEditar = (usuario) => {
    setNombre(usuario.nombre || '');
    setEmail(usuario.email || '');
    setPassword('');
    setRol(usuario.rol || 'OPERADOR');

    setEditando(true);
    setIdEditando(usuario.id_usuario);
  };

  const eliminarUsuario = async (id) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este usuario?');

    if (!confirmar) return;

    try {
      await API.delete(`/usuarios/${id}`);

      obtenerUsuarios();

      if (idEditando === id) {
        limpiarFormulario();
      }

      alert('Usuario eliminado');
    } catch (error) {
      console.log(error);
      alert('Error al eliminar usuario');
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        background: '#f1f5f9',
        minHeight: '100vh'
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          padding: '30px'
        }}
      >
        <h1 style={{ color: '#0f172a' }}>
          Gestión de Usuarios
        </h1>

        <div style={cardStyle}>
          <h2>
            {editando ? 'Editar Usuario' : 'Crear Usuario'}
          </h2>

          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={inputStyle}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder={
              editando
                ? 'Nueva password (opcional)'
                : 'Password'
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            style={inputStyle}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="OPERADOR">OPERADOR</option>
            <option value="CLIENTE">CLIENTE</option>
          </select>

          <button onClick={guardarUsuario} style={buttonStyle}>
            {editando ? 'Actualizar Usuario' : 'Crear Usuario'}
          </button>

          {editando && (
            <button onClick={limpiarFormulario} style={cancelButton}>
              Cancelar
            </button>
          )}

          <button
            onClick={() => exportarExcel(usuarios, 'usuarios')}
            style={excelButton}
          >
            Exportar Excel
          </button>

          <button
            onClick={() => exportarPDF(usuarios, 'usuarios')}
            style={pdfButton}
          >
            Exportar PDF
          </button>
        </div>

        <div>
          <h2>Lista de Usuarios</h2>

          {cargando && <p>Cargando usuarios...</p>}

          {!cargando && usuarios.length === 0 && (
            <p>No hay usuarios registrados.</p>
          )}

          {usuarios.map((u) => (
            <div key={u.id_usuario} style={cardStyle}>
              <p>
                <strong>ID:</strong> {u.id_usuario}
              </p>

              <p>
                <strong>Nombre:</strong> {u.nombre}
              </p>

              <p>
                <strong>Email:</strong> {u.email}
              </p>

              <p>
                <strong>Rol:</strong> {u.rol || 'OPERADOR'}
              </p>

              <button
                onClick={() => cargarUsuarioParaEditar(u)}
                style={editButton}
              >
                Editar
              </button>

              <button
                onClick={() => eliminarUsuario(u.id_usuario)}
                style={deleteButton}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: 'white',
  padding: '25px',
  borderRadius: '15px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  marginBottom: '20px'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '15px',
  borderRadius: '10px',
  border: '1px solid #cbd5e1',
  fontSize: '15px'
};

const buttonStyle = {
  background: '#2563eb',
  color: 'white',
  border: 'none',
  padding: '12px 20px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '15px',
  marginRight: '10px',
  marginBottom: '10px'
};

const editButton = {
  background: '#f59e0b',
  color: 'white',
  border: 'none',
  padding: '10px 15px',
  borderRadius: '10px',
  cursor: 'pointer',
  marginRight: '10px'
};

const cancelButton = {
  background: '#64748b',
  color: 'white',
  border: 'none',
  padding: '12px 20px',
  borderRadius: '10px',
  cursor: 'pointer',
  marginRight: '10px',
  marginBottom: '10px'
};

const excelButton = {
  background: '#16a34a',
  color: 'white',
  border: 'none',
  padding: '12px 20px',
  borderRadius: '10px',
  cursor: 'pointer',
  marginRight: '10px',
  marginBottom: '10px'
};

const pdfButton = {
  background: '#dc2626',
  color: 'white',
  border: 'none',
  padding: '12px 20px',
  borderRadius: '10px',
  cursor: 'pointer',
  marginRight: '10px',
  marginBottom: '10px'
};

const deleteButton = {
  background: '#dc2626',
  color: 'white',
  border: 'none',
  padding: '10px 15px',
  borderRadius: '10px',
  cursor: 'pointer'
};

export default Usuarios;
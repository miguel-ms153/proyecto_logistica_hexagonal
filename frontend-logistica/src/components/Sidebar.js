import { Link } from 'react-router-dom';

import {
  FaUsers,
  FaBox,
  FaShippingFast,
  FaClipboardList,
  FaMoneyBill,
  FaTruckMoving,
  FaChartLine,
  FaSignOutAlt,
  FaUserShield,
  FaBell,
  FaGlobeAmericas,
  FaFileInvoice,
  FaFolderOpen,
  FaRoute,
  FaFileAlt,
  FaHistory,
  FaUserCircle
} from 'react-icons/fa';

import {
  motion
} from 'framer-motion';

function Sidebar() {

  const usuario =
    JSON.parse(
      localStorage.getItem('usuario')
    );

  const rol =
    usuario?.rol;

  const logout = () => {

    localStorage.clear();

    window.location.href = '/';

  };

  return (

    <motion.div
      initial={{
        x: -100,
        opacity: 0
      }}
      animate={{
        x: 0,
        opacity: 1
      }}
      transition={{
        duration: 0.5
      }}
      className="
        w-60
        xl:w-64
        min-h-screen
        bg-gradient-to-b
        from-slate-950
        via-slate-900
        to-slate-800
        text-white
        p-4
        shadow-2xl
        flex
        flex-col
        justify-between
      "
    >

      <div>

        {/* LOGO */}

        <div
          className="
            mb-6
            border-b
            border-slate-700
            pb-4
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-cyan-500
                flex
                items-center
                justify-center
                text-xl
                shadow-xl
              "
            >
              🚚
            </div>

            <div>

              <h1
                className="
                  text-xl
                  font-bold
                  text-cyan-400
                  leading-tight
                "
              >
                Logística IA
              </h1>

              <p className="text-gray-400 text-xs">
                Sistema Hexagonal
              </p>

            </div>

          </div>

        </div>

        {/* USER */}

        <div
          className="
            bg-slate-800
            rounded-xl
            p-4
            mb-5
            shadow-lg
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                w-11
                h-11
                rounded-full
                bg-blue-600
                flex
                items-center
                justify-center
                text-base
                font-bold
                shadow-lg
              "
            >
              {
                usuario?.nombre
                  ?.charAt(0)
                  ?.toUpperCase()
              }
            </div>

            <div>

              <h2 className="font-bold text-base leading-tight">
                {usuario?.nombre}
              </h2>

              <p className="text-gray-400 text-xs break-all">
                {usuario?.email}
              </p>

            </div>

          </div>

          <div
            className="
              mt-3
              bg-blue-600
              px-3
              py-1.5
              rounded-lg
              flex
              items-center
              gap-2
              text-sm
              font-semibold
              w-fit
            "
          >

            <FaUserShield />

            {rol || 'OPERADOR'}

          </div>

        </div>

        {/* ALERTA */}

        <div
          className="
            bg-orange-500
            text-white
            p-3
            rounded-xl
            mb-5
            shadow-lg
            flex
            items-center
            gap-3
          "
        >

          <FaBell className="text-xl" />

          <div>

            <p className="font-bold">
              Tracking Live
            </p>

            <p className="text-xs">
              Embarques monitoreados
            </p>

          </div>

        </div>

        {/* MENU POR ROLES */}

        <nav className="space-y-1.5">

          {/* SOLO CLIENTE */}
          {
            rol === 'CLIENTE' && (
              <MenuItem
                to="/mi-panel"
                icon={<FaUserCircle />}
                text="Mi Panel"
              />
            )
          }

          {/* ADMIN Y OPERADOR */}
          {
            (
              rol === 'ADMIN' ||
              rol === 'OPERADOR'
            ) && (
              <MenuItem
                to="/dashboard"
                icon={<FaChartLine />}
                text="Dashboard"
              />
            )
          }

          {/* SOLO ADMIN */}
          {
            rol === 'ADMIN' && (
              <MenuItem
                to="/usuarios"
                icon={<FaUsers />}
                text="Usuarios"
              />
            )
          }

          {/* ADMIN Y OPERADOR */}
          {
            (
              rol === 'ADMIN' ||
              rol === 'OPERADOR'
            ) && (
              <>
                <MenuItem
                  to="/productos"
                  icon={<FaBox />}
                  text="Productos"
                />

                <MenuItem
                  to="/ordenes"
                  icon={<FaClipboardList />}
                  text="Órdenes"
                />

                <MenuItem
                  to="/embarques"
                  icon={<FaShippingFast />}
                  text="Embarques"
                />

                <MenuItem
                  to="/aduanas"
                  icon={<FaFileInvoice />}
                  text="Aduana"
                />

                <MenuItem
                  to="/documentos"
                  icon={<FaFolderOpen />}
                  text="Documentos"
                />

                <MenuItem
                  to="/reportes"
                  icon={<FaFileAlt />}
                  text="Reportes"
                />

                <MenuItem
                  to="/notificaciones"
                  icon={<FaBell />}
                  text="Notificaciones"
                />
              </>
            )
          }

          {/* TODOS LOS ROLES */}
          <MenuItem
            to="/orden-completa"
            icon={<FaClipboardList />}
            text="Nueva Orden"
          />

          {/* TODOS LOS ROLES */}
          <MenuItem
            to="/trazabilidad"
            icon={<FaRoute />}
            text="Trazabilidad"
          />

          {/* SOLO ADMIN */}
          {
            rol === 'ADMIN' && (
              <MenuItem
                to="/pagos"
                icon={<FaMoneyBill />}
                text="Pagos"
              />
            )
          }

          {/* SOLO ADMIN */}
          {
            rol === 'ADMIN' && (
              <MenuItem
                to="/bitacora"
                icon={<FaHistory />}
                text="Bitacora"
              />
            )
          }

          {/* TODOS LOS ROLES */}
          <MenuItem
            to="/tracking"
            icon={<FaTruckMoving />}
            text="Tracking"
          />

        </nav>

      </div>

      {/* FOOTER */}

      <div>

        <div
          className="
            bg-green-600
            rounded-xl
            p-3
            mb-4
            shadow-lg
            flex
            items-center
            gap-3
          "
        >

          <FaGlobeAmericas />

          <div>

            <p className="font-bold">
              Sistema Online
            </p>

            <p className="text-xs">
              IA Operativa
            </p>

          </div>

        </div>

        <button
          onClick={logout}
          className="
            w-full
            bg-red-600
            hover:bg-red-700
            transition
            py-3
            rounded-xl
            flex
            items-center
            justify-center
            gap-3
            font-bold
            shadow-lg
          "
        >

          <FaSignOutAlt />

          Cerrar Sesión

        </button>

      </div>

    </motion.div>

  );

}

function MenuItem({
  to,
  icon,
  text
}) {

  return (

    <Link
      to={to}
      className="
        flex
        items-center
        gap-3
        px-3
        py-2.5
        rounded-xl
        hover:bg-slate-800
        transition
        text-gray-200
        font-medium
        text-sm
        shadow-sm
        hover:shadow-lg
      "
    >

      <span className="text-cyan-400 text-lg">
        {icon}
      </span>

      {text}

    </Link>

  );

}

export default Sidebar;

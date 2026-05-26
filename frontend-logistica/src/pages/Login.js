import { useState } from 'react';

import API from '../services/api';

import {
  motion
} from 'framer-motion';

import {
  ToastContainer,
  toast
} from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

function Login() {

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const login = async () => {

    if (!email || !password) {

      toast.error(
        'Complete todos los campos'
      );

      return;

    }

    try {

      setLoading(true);

      const res =
        await API.post(
          '/usuarios/login',
          {
            email,
            password
          }
        );

      // TOKEN

      localStorage.setItem(
        'token',
        res.data.token
      );

      // USUARIO

      localStorage.setItem(
        'usuario',
        JSON.stringify(
          res.data.usuario
        )
      );

      toast.success(
        'Login exitoso'
      );

      setTimeout(() => {

        window.location.href =
          '/dashboard';

      }, 1500);

    } catch (error) {

      toast.error(
        'Credenciales incorrectas'
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-gradient-to-br
        from-slate-900
        via-slate-800
        to-blue-900
        p-5
      "
    >

      <ToastContainer />

      <motion.div

        initial={{
          opacity: 0,
          y: 40
        }}

        animate={{
          opacity: 1,
          y: 0
        }}

        transition={{
          duration: 0.6
        }}

        className="
          bg-white
          p-10
          rounded-3xl
          shadow-2xl
          w-full
          max-w-md
        "
      >

        {/* LOGO */}

        <div className="text-center mb-8">

          <div
            className="
              w-20
              h-20
              bg-blue-600
              rounded-full
              mx-auto
              flex
              items-center
              justify-center
              text-white
              text-3xl
              font-bold
              shadow-lg
            "
          >

            🚚

          </div>

          <h1
            className="
              text-4xl
              font-bold
              text-slate-800
              mt-5
            "
          >
            LOGÍSTICA
          </h1>

          <p className="text-gray-500 mt-2">

            Sistema Hexagonal Inteligente

          </p>

        </div>

        {/* EMAIL */}

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          className="
            w-full
            p-4
            border
            rounded-2xl
            mb-5
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        />

        {/* PASSWORD */}

        <div className="relative">

          <input
            type={
              showPassword
                ? 'text'
                : 'password'
            }
            placeholder="Contraseña"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="
              w-full
              p-4
              border
              rounded-2xl
              mb-6
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
            className="
              absolute
              right-4
              top-4
              text-gray-500
            "
          >

            {
              showPassword
                ? '🙈'
                : '👁️'
            }

          </button>

        </div>

        {/* BOTON */}

        <button
          onClick={login}
          disabled={loading}
          className="
            w-full
            bg-blue-600
            hover:bg-blue-700
            text-white
            py-4
            rounded-2xl
            font-semibold
            transition
            shadow-lg
          "
        >

          {

            loading
              ? 'Ingresando...'
              : 'Ingresar'

          }

        </button>

        {/* FOOTER */}

        <p
          className="
            text-center
            text-gray-400
            text-sm
            mt-8
          "
        >

          © 2026 Sistema Logístico IA

        </p>

      </motion.div>

    </div>

  );

}

export default Login;
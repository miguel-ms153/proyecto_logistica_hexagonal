import {
  useEffect,
  useState
} from 'react';

import API from '../services/api';

function Proveedores() {

  const [proveedores,
  setProveedores] =
  useState([]);

  useEffect(() => {

    API.get('/proveedores')

      .then((res) => {

        setProveedores(res.data);

      });

  }, []);

  return (

    <div>

      <h1>Proveedores</h1>

      {

        proveedores.map((p) => (

          <div key={p.id_proveedor}>

            <p>
              {p.nombre}
            </p>

          </div>

        ))

      }

    </div>

  );

}

export default Proveedores;
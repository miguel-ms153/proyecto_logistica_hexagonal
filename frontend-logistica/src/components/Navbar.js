function Navbar() {

  const logout = () => {

    localStorage.removeItem('token');

    window.location.href = '/';

  };

  return (

    <div className="navbar">

      <h2>
        Sistema Logístico
      </h2>

      <button onClick={logout}>
        Salir
      </button>

    </div>

  );

}

export default Navbar;
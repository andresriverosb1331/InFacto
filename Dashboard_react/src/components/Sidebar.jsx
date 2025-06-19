import { useState } from "react";
import { Link } from 'react-router-dom';
import '../assets/Sidebar.css';
import routes from '../routes';

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLinkClick = () => {
    if (!isCollapsed) {
      toggleCollapse();
    }
  };

  return (
    <>
      {isCollapsed && (
        <div className="menu" onClick={toggleCollapse}>
          <i className="icono-menu bi bi-list"></i>
        </div>
      )}
      <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="logo-container">
          <Link to={routes.home}>
            <span className="fs-4">Planificador</span>
          </Link>
          {!isCollapsed && (
            <div className="menuX" onClick={toggleCollapse}>
              <i className="icono-menu bi bi-x-lg"></i>
            </div>
          )}
        </div>
        <hr />
        <ul className="nav">
          <li className="nav-item">
            <button
              className="nav-link"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="submenu-planificacion"
            >
              <span className="me-2"><i className="bi bi-calendar3"></i></span>
              Planificación
              <span className="ms-auto">{open ? <i className="bi bi-chevron-up"></i> : <i className="bi bi-chevron-down"></i>}</span>
            </button>
            <div className={`collapse ${open ? 'show' : ''}`} id="submenu-planificacion">
              <ul className="nav flex-column ps-3">
                <li>
                  <Link to={routes.planificacionInicial} className="nav-link text-white ps-3" onClick={handleLinkClick}>
                    <i className="bi bi-dot me-2"></i>
                    Actual
                  </Link>
                </li>
                <li>
                  <Link to={routes.crear} className="nav-link text-white ps-3" onClick={handleLinkClick}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Crear
                  </Link>
                </li>
                <li>
                  <Link to={routes.historial} className="nav-link text-white ps-3" onClick={handleLinkClick}>
                    <i className="bi bi-clock-history me-2"></i>
                    Historial
                  </Link>
                </li>
              </ul>
            </div>
          </li>
          <li className="nav-item mb-2">
            <Link
              to={routes.control}
              className="nav-link text-white d-flex align-items-center w-100" onClick={handleLinkClick}
            >
              <span className="me-2"><i className="bi bi-speedometer2"></i></span>
              Control
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="#" className="nav-link text-white d-flex align-items-center w-100" onClick={handleLinkClick}>
              <span className="me-2"><i className="bi bi-box-arrow-right"></i></span>
              Salir
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;
import React, { useState } from "react";

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sidebar bg-dark d-flex flex-column p-3" style={{minHeight: "100vh", width: 260}}>
      <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <span className="fs-4">Planificador</span>
      </a>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item mb-2">
          <button
            className="nav-link text-white d-flex align-items-center w-100"
            onClick={() => setOpen(!open)}
            style={{background: "none", border: "none", padding: 0, textAlign: "left"}}
            aria-expanded={open}
            aria-controls="submenu-planificacion"
          >
            <span className="me-2"><i className="bi bi-calendar3"></i></span>
            Planificación
            <span className="ms-auto">{open ? <i className="bi bi-chevron-up"></i> : <i className="bi bi-chevron-down"></i>}</span>
          </button>
          <div className={`collapse${open ? ' show' : ''}`} id="submenu-planificacion">
            <ul className="nav flex-column ps-4">
              <li>
                <a href="#" className="nav-link text-white ps-0">
                  <i className="bi bi-dot me-2"></i>
                  Actual
                </a>
              </li>
              <li>
                <a href="#" className="nav-link text-white ps-0">
                  <i className="bi bi-plus-circle me-2"></i>
                  Crear
                </a>
              </li>
              <li>
                <a href="#" className="nav-link text-white ps-0">
                  <i className="bi bi-clock-history me-2"></i>
                  Historial
                </a>
              </li>
            </ul>
          </div>
        </li>
        <li className="nav-item mb-2">
          <a href="#" className="nav-link text-white d-flex align-items-center w-100" style={{background: "none", border: "none", padding: 0, textAlign: "left"}}>
            <span className="me-2"><i className="bi bi-speedometer2"></i></span>
            Dashboard
          </a>
        </li>
        <li className="nav-item mb-2">
          <a href="#" className="nav-link text-white d-flex align-items-center w-100" style={{background: "none", border: "none", padding: 0, textAlign: "left"}}>
            <span className="me-2"><i className="bi bi-box-arrow-right"></i></span>
            Salir
          </a>
        </li>
      </ul>
      <style>{`
        .sidebar .nav-link {
          text-align: left;
        }
        .sidebar .nav > .nav-item {
          margin-left: 0 !important;
        }
        .sidebar .nav .nav {
          margin-left: 0.5rem;
        }
        .sidebar .nav-item {
          margin-bottom: 0.5rem !important;
        }
        .sidebar .nav-item:last-child {
          margin-bottom: 0 !important;
        }
        @media (max-width: 991.98px) {
          .sidebar {
            width: 100vw !important;
            min-width: 0 !important;
            position: fixed;
            z-index: 1040;
            height: 100vh;
            left: 0;
            top: 0;
            transition: transform 0.3s ease;
          }
        }
      `}</style>
    </nav>
  );
};

export default Sidebar;

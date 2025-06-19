import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./assets/estilos.css";
import CartaGantt from "./pages/carta_gantt";
import Control from "./pages/control";
import PlanificacionInicial from "./pages/PlanificacionInicial";
import Historial from "./pages/Historial";  
import CrearPlanificacion from "./pages/crearplanificacion";

const App = () => {
  return (
    <BrowserRouter>
      <div className="d-flex" style={{ alignItems: "flex-start" }}>
        <Sidebar />
        <div className="flex-grow-1" style={{ minHeight: "100vh" }}>
          <Switch>
            <Route exact path="/">
              <Redirect to="/planificacion-inicial" />
            </Route>
            <Route path="/carta-gantt" component={CartaGantt} />
            <Route path="/control" component={Control} />
            <Route path="/planificacion-inicial" component={PlanificacionInicial} />
            <Route path="/historial" component={Historial} />
            <Route path="/crear-planificacion" component={CrearPlanificacion} />
          </Switch>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
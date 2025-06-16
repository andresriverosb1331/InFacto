import { BrowserRouter, Route, Switch } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./assets/estilos.css";
import CartaGantt from "./pages/carta_gantt";
import Control from "./pages/control";
import PlanificacionInicial from "./pages/planificacion_inicial";

const App = () => {
  return (
    <BrowserRouter>
      <div className="d-flex" style={{ alignItems: "flex-start" }}>
        <Sidebar />
        <div className="flex-grow-1" style={{ minHeight: "100vh" }}>
          <Switch>
            <Route path="/carta-gantt" component={CartaGantt} />
            <Route path="/control" component={Control} />
            <Route path="/planificacion-inicial" component={PlanificacionInicial} />
          </Switch>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
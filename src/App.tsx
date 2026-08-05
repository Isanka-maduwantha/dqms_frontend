import "./App.css";
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./app/routes/AppRoutes";
import  NavBar  from "./components/Navbar";
function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <main className="main-content">
           <AppRoutes />
      </main>
   
    </BrowserRouter>
  );
}

export default App;

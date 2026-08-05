import "./App.css";
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./app/routes/AppRoutes";
import  NavBar  from "./components/Navbar";
import FooterBar from "./components/FooterBar";
function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <main className="main-content">
           <AppRoutes />
      </main>
   
      <FooterBar />
    </BrowserRouter>
  );
}

export default App;

import "./App.css";
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./app/routes/AppRoutes";
import NavBar from "./components/Navbar";
import FooterBar from "./components/FooterBar";
function App() {
  return (
    <BrowserRouter>
      <main className="main-content min-h-screen relative flex flex-col justify-between">
        <NavBar/>
        <AppRoutes />
        <FooterBar />
      </main>
    </BrowserRouter>
  );
}

export default App;

import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Home from "./Views/home";
import Cadastro from "./Views/cadastro";
import Lista from "./Views/lista";

function AppRoutes() {
  const { user } = useAuth()
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/lista" element={user ? <Lista /> : <Navigate to="/" />}  />
    </Routes>
  )
}

export default AppRoutes;
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Home from "./Views/home";
import Cadastro from "./Views/cadastro";
import Lista from "./Views/lista";
import Layout from "./Views/Layout";
import User from "./Views/user";

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gray-900 h-screen">
        <div className="text-white">Carregando sessão...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/lista" /> : <Home />} />

      <Route element={<Layout />}>
        <Route
          path="/cadastro"
          element={user ? <Cadastro /> : <Navigate to="/" />}
        />
        <Route path="/lista" element={user ? <Lista /> : <Navigate to="/" />} />

        <Route
          path="/user/:userId"
          element={user ? <User /> : <Navigate to="/" />}
        />
      </Route>
    </Routes>
  );
}

export default AppRoutes;

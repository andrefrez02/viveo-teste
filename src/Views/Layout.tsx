import { Outlet } from "react-router-dom";
import Header from "./_header";

export default function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}

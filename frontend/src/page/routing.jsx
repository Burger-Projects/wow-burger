import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/webPages/Header/header";
import Footer from "../components/webPages/Footer/footer";

const Routing = () => {
  const location = useLocation();
  const path = location.pathname.split("/")[1];
  const hideChrome = ["login", "register", "admin", "menu"].includes(path);

  return (
    <>
      {!hideChrome && <Header />}
      <div className={path !== "" ? "page-content" : ""}>
        <Outlet />
      </div>
      {!hideChrome && <Footer />}
    </>
  );
};

export default Routing;

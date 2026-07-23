import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/webPages/Header/header";
import Footer from "../components/webPages/Footer/footer";

const Routing = () => {
  const location = useLocation();
  const path = location.pathname.split("/")[1];
  console.log(path);

  return (
    <>
      {path !== "login" && <Header />}
      <div className={path !== "" ? "page-content" : ""}>
        <div className="header-spacer" />
        <Outlet />
      </div>
      {path !== "login" && <Footer />}
    </>
  );
};

export default Routing;

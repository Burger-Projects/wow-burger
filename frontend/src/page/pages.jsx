import React from "react";
import Home from "../components/webPages/Home/Home";
import About from "../components/webPages/About/about";
import Service from "../components/webPages/Service/service";
import Contact from "../components/webPages/Contact/contact";
import ChiefMassage from "../components/webPages/chief-message/chiefMassage";

const Pages = () => {
  return (
    <>
      {/* <Header /> */}
      <Home />
      <About />
      <Service />
      <ChiefMassage />
      <Contact />
      {/* <Footer /> */}
    </>
  );
};

export default Pages;

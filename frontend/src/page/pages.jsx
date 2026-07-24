import React from "react";
import Home from "../components/webPages/Home/Home";
import About from "../components/webPages/About/about";
import Service from "../components/webPages/Service/service";
import ChiefMassage from "../components/webPages/chief-message/chiefMassage";
import Testimonials from "../components/webPages/Testimonials/Testimonials";
import RateExperience from "../components/webPages/RateExperience/RateExperience";
import Contact from "../components/webPages/Contact/contact";

const Pages = () => {
  return (
    <>
      {/* <Header /> */}
      <Home />
      <About />
      <Service />
      <ChiefMassage />
      <Testimonials />
      <RateExperience />
      <Contact />
      {/* <Footer /> */}
    </>
  );
};

export default Pages;

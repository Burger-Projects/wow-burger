import React from "react";
import "./App.css";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Routing from "./page/routing";
import Pages from "./page/pages";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Routing />}>
          <Route path="/" element={<Pages />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

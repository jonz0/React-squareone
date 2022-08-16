import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.css";
import Counter from "./components/counter.jsx";
import Counters from "./components/counters";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Counters />);

reportWebVitals();

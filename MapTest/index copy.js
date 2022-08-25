import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ChakraProvider, theme } from "@chakra-ui/react";

// const express = require("express");
// const PORT = process.env.PORT || 3001;
// const app = express();
// app.listen(PORT, () => {
//   console.log(`Server listening on ${PORT}`);
// });

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);

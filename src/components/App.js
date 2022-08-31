import React from "react";
import { useRef, useState } from "react";
import Signup from "./Signup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import AuthProvider from "../contexts/AuthContext";
import { useAuth } from "../contexts/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Login from "./Login";
import PrivateRoute from "./PrivateRoute";
import { Switch } from "@chakra-ui/react";

function App() {
  return (
    <AuthProvider>
      <Container
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="w-100" style={{ maxWidth: "400px" }}>
          <Router>
            <AuthProvider>
              <Routes>
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </AuthProvider>
          </Router>{" "}
        </div>
      </Container>
    </AuthProvider>
  );
}

export default App;

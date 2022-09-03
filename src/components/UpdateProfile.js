import userEvent from "@testing-library/user-event";
import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import "./Signup.css";
import { useAuth } from "../contexts/AuthContext";
import { Link, Navigate, useNavigate } from "react-router-dom";
import validator from "validator";

export default function UpdateProfile() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, updateEmail, updatePassword } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();

    switch (true) {
      case !validator.isEmail(emailRef.current.value):
        return setError("Not a valid email.");
      case passwordRef.current.value !== passwordConfirmRef.current.value:
        return setError("Passwords do not match.");
      case passwordRef.current.value.length < 6:
        return setError(
          "Password should have a minimum length of 6 characters."
        );
      case passwordRef.current.value.length > 32:
        return setError(
          "Password should have a maximum length of 32 characters."
        );
    }

    const promises = [];
    setLoading(true);
    setError("");
    if (emailRef.current.value !== currentUser.email) {
      promises.push(updateEmail(emailRef.current.value));
    }
    if (passwordRef.current.value !== currentUser.password) {
      promises.push(updatePassword(passwordRef.current.value));
    }

    Promise.all(promises)
      .then((result) => {
        setError("Failed to update account.");
      })
      .catch((error) => {
        setError("Failed to update account.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Update Profile</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                ref={emailRef}
                defaultValue={currentUser.email}
              />
            </Form.Group>

            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                ref={passwordRef}
                required
                placeholder="Leave blank to keep the same password"
              ></Form.Control>
            </Form.Group>

            <Form.Group id="password-confirm">
              <Form.Label>Password Confirmation</Form.Label>
              <Form.Control
                type="password"
                ref={passwordConfirmRef}
                required
              ></Form.Control>
            </Form.Group>
            <Button disabled={loading} className="w-100" type="submit">
              Update
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Cancel <Link to="/">Cancel</Link>
      </div>
    </>
  );
}

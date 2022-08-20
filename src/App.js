import React, { useState, useRef, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import TodoList from "./TodoList";
import { v4 as uuidv4 } from "uuid";

function App() {
  const todoNameRef = useRef();
  const [todos, setTodos] = useState([]);
  const LOCAL_STORAGE_KEY = "todoApp.todos";

  function handleAddTodo(event) {
    const name = todoNameRef.current.value;
    const uuid = uuidv4();
    if (name === "") return;
    console.log(name);
    setTodos((prevTodos) => {
      return [...prevTodos, { id: uuid, name: name, complete: false }];
    });
    console.log(uuid);
    todoNameRef.current.value = null;
  }

  function toggleTodo(id) {
    const newTodos = [...todos];
    const todo = newTodos.find((todo) => todo.id === id);
    todo.complete = !todo.complete;
    setTodos(newTodos);
  }

  function handleClearTodos() {
    setTodos(todos.filter((todo) => !todo.complete));
  }

  useEffect(() => {
    const storedTodos = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (storedTodos) setTodos((prevTodos) => [...prevTodos, ...storedTodos]);
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  return (
    <>
      <TodoList todos={todos} toggleTodo={toggleTodo} />
      <input ref={todoNameRef} type="text" />
      <button onClick={handleAddTodo}>Add Todo</button>
      <button onClick={handleClearTodos}>Clear Todos</button>
      <div>{todos.filter((todo) => !todo.complete).length} left to do</div>
    </>
  );
}

export default App;

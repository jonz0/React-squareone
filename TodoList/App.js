import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import TodoList from "./components/TodoList";
import { v4 as uuidv4 } from "uuid";

function App() {
  const todoNameRef = useRef();
  const [todos, setTodos] = useState([]);
  const LOCAL_STORAGE_KEY = "todoApp.todos";

  /* Appends previous todos along with a new todo. Used when the add todo button is pressed. */
  function handleAddTodo(event) {
    const name = todoNameRef.current.value;
    const uuid = uuidv4();
    if (name === "") return;
    setTodos((prevTodos) => {
      return [...prevTodos, { id: uuid, name: name, complete: false }];
    });
    todoNameRef.current.value = null;
  }

  /* Toggles the complete state in todo component. Used when a todo checkbox is clicked. */
  function toggleTodo(id) {
    const newTodos = [...todos];
    const todo = newTodos.find((todo) => todo.id === id);
    todo.complete = !todo.complete;
    setTodos(newTodos);
  }

  /* Clears checked todo components. */
  function handleClearTodos() {
    setTodos(todos.filter((todo) => !todo.complete));
  }

  /* Restores stored todos once upon rendering. */
  useEffect(() => {
    const storedTodos = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (storedTodos) setTodos((prevTodos) => [...prevTodos, ...storedTodos]);
  }, []);

  /* Inputs todos in browser storage each time the todos state is modified. */
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  /* Todo list output */
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

import React from "react";
import Todo from "./Todo";

/* The TodoList component, which is an array of Todo components. */
export default function TodoList({ todos, toggleTodo }) {
  return todos.map((todo) => {
    return <Todo key={todo.id} todo={todo} toggleTodo={toggleTodo} />;
  });
}

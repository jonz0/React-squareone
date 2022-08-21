import React from "react";

/* The Todo component, which contains a checkbox and the todo name. */
export default function Todo({ todo, toggleTodo }) {
  function handleTodoClick() {
    toggleTodo(todo.id);
  }
  return (
    <div>
      <label>
        <input type="checkbox" onChange={handleTodoClick} />
        {todo.name}
      </label>
    </div>
  );
}

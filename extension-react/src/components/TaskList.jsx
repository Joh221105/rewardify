import { useState, useEffect, useRef } from "react";
import ConfirmationPopUp from "./ConfirmationPopUp";

function TaskList({ setView, coins, setCoins }) {
  // initialization of variables
  const [tasks, setTasks] = useState([]); // holds task objects {text: string, done: boolean, value: int}
  const [taskValue, setTaskValue] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");

  // confirmation popup state
  const [showConfirm, setShowConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // animation state for coin and text
  const [animate, setAnimate] = useState(false);
  const [coinChange, setCoinChange] = useState(null); // {i.e.  amount: +5/-3, id: unique }
  const prevCoins = useRef(coins);

  // coin and text animation effect whenever coins changes
  useEffect(() => {
    const diff = coins - prevCoins.current;
    if (diff !== 0) {
      // trigger coin pop
      setAnimate(true);
      setTimeout(() => setAnimate(false), 300);

      // trigger floating number
      setCoinChange({ amount: diff, id: Date.now() });
    }
    prevCoins.current = coins;
  }, [coins]);

  // remove floating number after 1 second: clean up
  useEffect(() => {
    if (coinChange) {
      const timeout = setTimeout(() => setCoinChange(null), 1000);
      return () => clearTimeout(timeout);
    }
  }, [coinChange]);

  // render tasks in the list
  function renderTasks() {
    return tasks
      .filter((task) => !task.done) // filter out completed tasks
      .map(
        (
          task,
          index //loops over each of the tasks in taskList and create a li element
        ) => (
          <li
            key={index}
            className="flex items-center justify-between bg-white p-2 mb-2 rounded shadow-sm"
          >
            {editMode ? (
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  value={task.text}
                  onChange={(e) => updateTask(index, "text", e.target.value)}
                  className="flex-1 border rounded px-2 py-1"
                />
                <select
                  value={task.value || 1}
                  onChange={(e) =>
                    updateTask(index, "value", parseInt(e.target.value))
                  }
                  className="border rounded px-2 py-1"
                >
                  {[1, 2, 3, 4, 5].map((val) => (
                    <option key={val} value={val}>
                      {val} coin{val > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setTaskToDelete(task); // store the actual task object
                    setShowConfirm(true); // open popup
                  }}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ) : (
              <span
                onClick={() => completeTask(index)}
                className="cursor-pointer flex-1 hover:bg-green-500 hover:text-white p-2 rounded"
              >
                {task.text} (+{task.value || 1})
              </span>
            )}
          </li>
        )
      );
  }

  // marks task as completed, increases coins, saves data
  function completeTask(index) {
    if (!tasks[index].done) {
      const updatedTasks = [...tasks];
      updatedTasks[index].done = true;
      const newCoins = coins + (updatedTasks[index].value || 1);
      const remainingTasks = updatedTasks.filter((_, i) => i !== index); // remove completed tasks from the array
      setTasks(remainingTasks);
      setCoins(newCoins);
      saveData(remainingTasks, newCoins);
    }
  }

  // save tasks and coins to chrome storage and re-render
  function saveData(updatedTasks, updatedCoins) {
    chrome.storage.sync.set({ tasks: updatedTasks, coins: updatedCoins });
  }

  // update task fields while editing
  function updateTask(index, field, value) {
    const updatedTasks = [...tasks];
    updatedTasks[index][field] = value;
    setTasks(updatedTasks);
    saveData(updatedTasks, coins);
  }

  // delete a task
  function deleteTask(index) {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    saveData(updatedTasks, coins);
  }

  // hook up functionality to add task button
  function addTask() {
    const input = document.getElementById("new-task");
    if (!input.value.trim()) {
      setError("Task name cannot be empty.");
    } else {
      // validates and adds a new task to the tasks array
      const newTasks = [
        ...tasks,
        { text: input.value, done: false, value: taskValue },
      ];
      setTasks(newTasks);
      input.value = ""; // clear input field
      setError("");
      setTaskValue(1);
      saveData(newTasks, coins);
    }
  }

  function openRewards() {
    setView("rewards");
  }

  // Load data from storage upoon initialization
  useEffect(() => {
    chrome.storage.sync.get(["tasks", "coins"], (data) => {
      setTasks(data.tasks || []);
      setCoins(data.coins || 0);
    });
  }, []);

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      {showConfirm && taskToDelete && (
        <ConfirmationPopUp
          message={`Are you sure you want to delete "${taskToDelete.text}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="red"
          onConfirm={() => {
            const updatedTasks = tasks.filter((t) => t !== taskToDelete);
            setTasks(updatedTasks);
            saveData(updatedTasks, coins);
            setShowConfirm(false);
            setTaskToDelete(null); // clear state
          }}
          onCancel={() => {
            setShowConfirm(false);
            setTaskToDelete(null); // clear state
          }}
        />
      )}

      <h2 className="relative text-xl font-bold mb-4 flex items-center gap-2">
        <img
          src="icons/coin.png"
          alt="coin"
          className={`w-6 h-6 ${animate ? "coin-animate" : ""}`}
        />
        {coins}
        {coinChange && (
          <span
            key={coinChange.id}
            className={`coin-change ml-2 ${
              coinChange.amount > 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {coinChange.amount > 0
              ? `+${coinChange.amount}`
              : coinChange.amount}
          </span>
        )}
      </h2>

      <button
        onClick={() => setEditMode(!editMode)}
        className="mb-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
      >
        {editMode ? "Done" : "Edit Mode"}
      </button>
      <ul className="mb-4">{renderTasks()}</ul>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          id="new-task"
          placeholder="New task"
          className="flex-1 border rounded px-2 py-1"
        />
        <select
          value={taskValue}
          onChange={(e) => setTaskValue(parseInt(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {[1, 2, 3, 4, 5].map((val) => (
            <option key={val} value={val}>
              {val} coin{val > 1 ? "s" : ""}
            </option>
          ))}
        </select>

        <button
          id="add-task"
          onClick={addTask}
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        >
          Add
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <button
        id="open-rewards"
        onClick={() => setView("rewards")}
        className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
      >
        Rewards
      </button>
    </div>
  );
}

export default TaskList;

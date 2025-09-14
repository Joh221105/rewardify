import { useState, useEffect } from "react";

function TaskList({setView, coins, setCoins}) {
  // initialization of variables
  const [tasks, setTasks] = useState([]); // holds task objects {text: string, done: boolean, value: int}
  const [taskValue, setTaskValue] = useState(1);
  const [editMode, setEditMode] = useState(false);

 // render tasks in the list
  function renderTasks() {
    return tasks
      .filter((task) => !task.done) // filter out completed tasks
      .map((task, index) => {
        //loops over each of the tasks in taskList and create a li element
        return (
          <li key={index}>
            {editMode ? (
              <>
                <input
                  type="text"
                  value={task.text}
                  onChange={(e) => updateTask(index, "text", e.target.value)}
                />
                <select
                  value={task.value || 1}
                  onChange={(e) =>
                    updateTask(index, "value", parseInt(e.target.value))
                  }
                >
                  {[1, 2, 3, 4, 5].map((val) => (
                    <option key={val} value={val}>
                      {val} coin{val > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
                <button onClick={() => deleteTask(index)}>Delete</button>
              </>
            ) : (
              <span onClick={() => completeTask(index)}>
                {task.text} (+ {task.value || 1})
              </span>
            )}
          </li>
        );
      });
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
    if (input.value.trim()) {
      // validates and adds a new task to the tasks array
      const newTasks = [
        ...tasks,
        { text: input.value, done: false, value: taskValue },
      ];
      setTasks(newTasks);
      input.value = ""; // clear input field
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
    <div>
      <h2>Coins: {coins}</h2>
      <button onClick={() => setEditMode(!editMode)}>
        {editMode ? "Done" : "Edit Mode"}
      </button>
      <ul>{renderTasks()}</ul>
      <input type="text" id="new-task" placeholder="New task" />
      <select
        value={taskValue}
        onChange={(e) => setTaskValue(parseInt(e.target.value))}
      >
        {[1, 2, 3, 4, 5].map((val) => (
          <option key={val} value={val}>
            {val} coin{val > 1 ? "s" : ""}
          </option>
        ))}
      </select>
      <button id="add-task" onClick={addTask}>
        Add Task
      </button>
      <button id="open-rewards" onClick={openRewards}>
        Rewards
      </button>
    </div>
  );
}

export default TaskList;

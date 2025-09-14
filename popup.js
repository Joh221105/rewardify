// initialization of variables
let coins = 0;
let tasks = []; // holds task objects {text: string, done: boolean}
let editMode = false;

// target DOM elements for coins and tasks
const coinCount = document.getElementById("coin-count");
const taskList = document.getElementById("task-list");

// render tasks in the list
function renderTasks() {
  taskList.innerHTML = ""; // clear task display
  tasks
    .filter((task) => !task.done) // filter out completed tasks
    .forEach((task, index) => {
      //loops over each of the tasks in taskList and create a li element , and set its text and a linethrough if it is completed
      const li = document.createElement("li");

      if (editMode) {
        const input = document.createElement("input");
        input.type = "text";
        input.value = task.text;
        input.dataset.index = index;

        const valueSelect = document.createElement("select");
        valueSelect.dataset.index = index;
        for (let i = 1; i <= 5; i++) {
          const opt = document.createElement("option");
          opt.value = i;
          opt.textContent = `${i} coin${i > 1 ? "s" : ""}`;
          if (i === task.value) opt.selected = true;
          valueSelect.appendChild(opt);
        }

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => {
          const confirmed = confirm(
            `Are you sure you want to delete "${task.text}"?`
          );
          if (confirmed) {
            tasks.splice(index, 1);
            saveData();
          }
        });

        li.appendChild(input);
        li.appendChild(valueSelect);
        li.appendChild(deleteBtn);
      } else {
        li.textContent = `${task.text} (+${task.value} coins)`;
        if (task.done) {
          tasks.splice(index, 1); // remove the completed task from the array
        }

        li.addEventListener("click", () => completeTask(index));
      } // hook each of the task with a click event to fire the completeTask function
      taskList.appendChild(li); //append the li element to the <ul id = "task-list">
    });
}

// marks task as completed, increases coins, saves data
function completeTask(index) {
  if (!tasks[index].done) {
    tasks[index].done = true;
    coins += tasks[index].value;
    tasks = tasks.filter((task) => !task.done); // remove completed tasks from the array
    saveData();
  }
}

// save tasks and coins to chrome storage and re-render
function saveData() {
  chrome.storage.sync.set({ tasks, coins }, () => render());
}

// loads the coin count and tasks
function render() {
  coinCount.textContent = coins;
  renderTasks();
}

// hook up functionality to add task button
document.getElementById("add-task").addEventListener("click", () => {
  const input = document.getElementById("new-task");
  const valueSelect = document.getElementById("task-value"); // get the selected input reward value for task
  if (input.value.trim()) {
    // validates and adds a new task to the tasks array
    tasks.push({
      text: input.value,
      done: false,
      value: parseInt(valueSelect.value) || 1,
    });
    input.value = ""; // clear input field
    valueSelect.value = "1"; // reset dropdown
    saveData();
  }
});

// navigate to rewards page
document.getElementById("open-rewards").addEventListener("click", () => {
  window.location.href = "rewards.html";
});

// toggle edit mode
document.getElementById("toggle-edit").addEventListener("click", () => {
  if (editMode) {
    const taskInputs = document.querySelectorAll(
      "input[type='text'][data-index]"
    );
    taskInputs.forEach((input) => {
      const i = input.dataset.index;
      tasks[i].text = input.value.trim() || tasks[i].text;
    });

    saveData();
  }

  editMode = !editMode;
  document.getElementById("toggle-edit").textContent = editMode
    ? "Done"
    : "Edit Mode";
  renderTasks();
});

// Load data from storage upoon initialization
chrome.storage.sync.get(["tasks", "coins"], (data) => {
  tasks = data.tasks || [];
  coins = data.coins || 0;
  render();
});

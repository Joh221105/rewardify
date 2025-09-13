// initialization of variables
let coins = 0;  
let tasks = [];   // holds task objects {text: string, done: boolean} 

// target DOM elements for coins and tasks
const coinCount = document.getElementById("coin-count");
const taskList = document.getElementById("task-list");

// render tasks in the list
function renderTasks() {
  taskList.innerHTML = "";  // clear task display
  tasks
  .filter(task => !task.done)  // filter out completed tasks
  .forEach((task, index) => { //loops over each of the tasks in taskList and create a li element , and set its text and a linethrough if it is completed
    const li = document.createElement("li");
    li.textContent = task.text;
    if (task.done) {
        tasks.splice(index, 1); // remove the completed task from the array
    }

    li.addEventListener("click", () => completeTask(index));    // hook each of the task with a click event to fire the completeTask function
    taskList.appendChild(li);  //append the li element to the <ul id = "task-list">
  });
}

// marks task as completed, increases coins, saves data
function completeTask(index) {
  if (!tasks[index].done) { 
    tasks[index].done = true;
    coins++;
    tasks = tasks.filter(task => !task.done); // remove completed tasks from the array
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
  if (input.value.trim()) {   // validates and adds a new task to the tasks array
    tasks.push({ text: input.value, done: false });
    input.value = "";  // clear input field
    saveData();
  }
});

// Load data from storage upoon initialization
chrome.storage.sync.get(["tasks", "coins"], (data) => {
  tasks = data.tasks || [];
  coins = data.coins || 0;
  render();
});

import { useState } from "react";
import TaskList from "./components/TaskList";
import RewardsList from "./components/RewardsList";

function App() {
  const [view, setView] = useState("tasks"); // "tasks" or "rewards"

  return (
    <div>
      {view === "tasks" && <TaskList setView={setView} />}
      {view === "rewards" && <RewardsList setView={setView} />}
    </div>
  );
}

export default App;

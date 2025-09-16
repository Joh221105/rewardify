import { useState, useEffect } from "react";
import TaskList from "./components/TaskList";
import RewardsList from "./components/RewardsList";
import PomodoroTimer from "./components/PomodoroTimer";
import ShopPage from "./components/ShopPage";

function App() {
  const [view, setView] = useState("tasks"); 
  const [coins, setCoins] = useState(0);

  // load coins on startup
  useEffect(() => {
    chrome.storage.sync.get(["coins"], (data) => {
      setCoins(data.coins || 0);
    });
  }, []);

  useEffect(() => {
    chrome.storage.sync.set({ coins });
  }, [coins]);

  return (
    <div>
      {view === "tasks" && <TaskList setView={setView} coins={coins} setCoins={setCoins} />}
      {view === "rewards" && <RewardsList setView={setView} coins={coins} setCoins={setCoins} />}
      {view === "shop" && <ShopPage setView={setView} coins={coins} setCoins={setCoins} />}
      {view === "pomodoro" && <PomodoroTimer setView={setView} coins={coins} setCoins={setCoins} />}
    </div>
  );
}

export default App;

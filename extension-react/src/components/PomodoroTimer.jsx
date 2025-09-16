import { useState, useEffect, useRef } from "react";

function PomodoroTimer({ setCoins, coins }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds, first cycle
  const [sessionDuration, setSessionDuration] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("Focus"); // Focus | Short Break | Long Break
  const [cycles, setCycles] = useState(0); // number of completed focus sessions
  const timerRef = useRef(null);

  // Load timer state from storage on mount
  useEffect(() => {
    chrome.storage.local.get(
      ["endTime", "paused", "pausedTime", "mode", "cycles"],
      (data) => {
        if (data.mode) setMode(data.mode);
        if (data.cycles) setCycles(data.cycles);

        if (data.paused) {
          setIsRunning(false);
          setTimeLeft(data.pausedTime || 25 * 60);
        } else if (data.endTime) {
          const diff = Math.max(
            0,
            Math.floor((data.endTime - Date.now()) / 1000)
          );
          setTimeLeft(diff);
          if (diff > 0) setIsRunning(true);
        }
      }
    );
  }, []);

  // update timeLeft every second if running
  useEffect(() => {
    if (!isRunning) return;

    function updateTime() {
      chrome.storage.local.get(["endTime"], (data) => {
        if (data.endTime) {
          const diff = Math.max(
            0,
            Math.floor((data.endTime - Date.now()) / 1000)
          );
          setTimeLeft(diff);

          if (diff === 0) {
            handleSessionComplete();
          }
        }
      });
    }

    // run once immediately
    updateTime();

    // then keep running every second
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // format s into mm:ss
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function notifyUser(title, message) {
    if (Notification.permission === "granted") {
      new Notification(title, { body: message, icon: "icons/coin.png" });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body: message, icon: "icons/coin.png" });
        }
      });
    }
  }

  // SVG circle component for progress ring
  function ProgressCircle({ progress }) {
    const radius = 100;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - progress * circumference;

    return (
      <svg width="220" height="220" className="mb-6">
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth="12"
          r={radius}
          cx="110"
          cy="110"
        />
        <circle
          stroke="#10b981"
          fill="transparent"
          strokeWidth="12"
          strokeLinecap="round"
          r={radius}
          cx="110"
          cy="110"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)} // clockwise movement
          style={{
            transition: "stroke-dashoffset 1s linear",
            transform: "rotate(-90deg)", // 12 o' clock start
            transformOrigin: "50% 50%",
          }}
        />
      </svg>
    );
  }

  function startTimer() {
    const endTime = Date.now() + timeLeft * 1000; // *1000 to convert to ms
    chrome.storage.local.set({ endTime, paused: false });
    setIsRunning(true);
  }

  function pauseTimer() {
    chrome.storage.local.set({ paused: true, pausedTime: timeLeft });
    setIsRunning(false);
  }

  function resetTimer(newMode = "Focus") {
    //TEMP for testing
    let newTime = 10; // 10s for Focus
    if (newMode === "Short Break") newTime = 5; // 5s for Short Break
    if (newMode === "Long Break") newTime = 8; // 8s for Long Break

    setIsRunning(false);
    setTimeLeft(newTime);
    setSessionDuration(newTime);
    setMode(newMode);

    chrome.storage.local.set({
      paused: true,
      pausedTime: newTime,
      mode: newMode,
    });
  }

  // handle end of a session and next cycle
  function handleSessionComplete() {
    setIsRunning(false);

    if (mode === "Focus") {
      setCoins(coins + 1);
      const nextCycle = cycles + 1;
      setCycles(nextCycle);

      notifyUser("Focus Complete 🎉", "Take a short break!");

      if (nextCycle % 4 === 0) {
        resetTimer("Long Break");
      } else {
        resetTimer("Short Break");
      }
    } else if (mode === "Short Break") {
      notifyUser("Break Over ⏰", "Time to focus again!");
      resetTimer("Focus");
    } else {
      notifyUser("Long Break Finished ✅", "Back to focus!");
      resetTimer("Focus");
    }
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md flex flex-col items-center w-72">
      {/* Mode label */}
      <h2 className="text-2xl font-medium mb-2">{mode}</h2>

      {/* Timer */}
      <div className="relative flex items-center justify-center mb-4 w-[220px] h-[220px] translate-y-2">
        <ProgressCircle progress={timeLeft / sessionDuration} />
        <span className="absolute text-6xl font-mono font-bold -translate-y-2">
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < cycles % 4 ? "bg-green-500" : "bg-gray-300"
            }`}
          ></span>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="w-12 h-12 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600"
          >
            {/* Play */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="w-12 h-12 flex items-center justify-center bg-yellow-500 text-white rounded-full hover:bg-yellow-600"
          >
            {/* Pause */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </button>
        )}

        <button
          onClick={() => resetTimer(mode)}
          className="w-12 h-12 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600"
        >
          {/* Reset */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6a6 6 0 11-12 0H9a4 4 0 108 0c0-2.2-1.8-4-4-4z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default PomodoroTimer;

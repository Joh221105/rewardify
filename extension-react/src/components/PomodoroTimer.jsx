import { useState, useEffect, useRef } from "react";

function PomodoroTimer({ setCoins, coins }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);  // 25 minutes in seconds, first cycle
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("Focus"); // Focus | Short Break | Long Break
  const [cycles, setCycles] = useState(0); // number of completed focus sessions
  const timerRef = useRef(null);

  // format s into mm:ss
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function toggleTimer() {
    setIsRunning(!isRunning);
  }

  function resetTimer(newMode = "Focus") {
    setIsRunning(false);
    if (newMode === "Focus") setTimeLeft(25 * 60);
    if (newMode === "Short Break") setTimeLeft(5 * 60);
    if (newMode === "Long Break") setTimeLeft(20 * 60);
    setMode(newMode);
  }

  // timer effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }
    return () => clearTimeout(timerRef.current);
  }, [isRunning, timeLeft]);

  // handle end of a session and next cycle
  function handleSessionComplete() {
    setIsRunning(false);

    if (mode === "Focus") {
      setCoins(coins + 1);
      const nextCycle = cycles + 1;
      setCycles(nextCycle);

      if (nextCycle % 4 === 0) {
        resetTimer("Long Break");
      } else {
        resetTimer("Short Break");
      }
    } else {
      resetTimer("Focus");
    }
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md flex flex-col items-center w-72">
      {/* Mode label */}
      <h2 className="text-lg font-medium mb-2">{mode}</h2>

      {/* Timer */}
      <p className="text-5xl font-mono font-bold mb-4">{formatTime(timeLeft)}</p>

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
        <button
          onClick={toggleTimer}
          className="w-12 h-12 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600"
        >
          {/* Play */}
          {!isRunning && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}

          {/* Pause */}
          {isRunning && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </button>

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

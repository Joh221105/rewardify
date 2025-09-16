import { useState, useEffect, useRef } from "react";
import ConfirmationPopUp from "./ConfirmationPopUp";

function ShopPage({ setView, coins, setCoins }) {
  // initialization of variables
  const [rewards, setRewards] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [rewardName, setRewardName] = useState("");
  const [rewardCost, setRewardCost] = useState("");
  const [error, setError] = useState(""); // holds error messages
  const [showAddReward, setShowAddReward] = useState(false);

  // confirmation popup state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // "redeem" or "delete"
  const [selectedReward, setSelectedReward] = useState(null);

  const [animate, setAnimate] = useState(false);
  const [coinChange, setCoinChange] = useState(null); // {i.e.  amount: +5/-3, id: unique }
  const prevCoins = useRef(coins);

  // animate coins when they change
  useEffect(() => {
    const diff = coins - prevCoins.current;
    if (diff !== 0) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 300);
      setCoinChange({ amount: diff, id: Date.now() });
    }
    prevCoins.current = coins;
  }, [coins]);

  // render rewards in the list
  function renderRewards() {
    return rewards.map((reward, index) => {
      return (
        <li
          key={index}
          className="flex items-center justify-between bg-white p-4 mb-3 rounded-xl shadow hover:shadow-md transition"
        >
          {!editMode && (
            <div className="flex-1 flex justify-between items-center">
              <span className="font-medium">{reward.name}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-yellow-600 font-semibold">
                  <img src="icons/coin.png" alt="coin" className="w-5 h-5" />
                  {reward.cost}
                </div>
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  disabled={coins < reward.cost}
                  onClick={() => {
                    setSelectedReward(reward);
                    setConfirmAction("redeem");
                    setShowConfirm(true);
                  }}
                >
                  Redeem
                </button>
              </div>
            </div>
          )}

          {/* Edit mode: edit and delete buttons */}
          {editMode && (
            <div className="flex gap-2 w-full items-center">
              <input
                type="text"
                value={reward.name}
                onChange={(e) => updateReward(index, "name", e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                value={reward.cost}
                min="1"
                max="999"
                onChange={(e) =>
                  updateReward(index, "cost", parseInt(e.target.value))
                }
                className="w-24 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={() => {
                  setSelectedReward(reward);
                  setConfirmAction("delete");
                  setShowConfirm(true);
                }}
                className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          )}
        </li>
      );
    });
  }

  // save rewards and coins to chrome storage and re-render
  function saveData(updatedRewards, updatedCoins) {
    chrome.storage.sync.set(
      { coins: updatedCoins, rewards: updatedRewards },
      () => {
        setRewards(updatedRewards);
        setCoins(updatedCoins);
      }
    );
  }

  // helper to update reward fields while in edit mode
  function updateReward(index, field, value) {
    const updatedRewards = [...rewards];
    if (field === "cost") {
      if (value < 1 || value > 999) {
        setError("Reward cost must be between 1 and 999.");
        return;
      }
      updatedRewards[index][field] = value;
      setError("");
    } else {
      updatedRewards[index][field] = value;
    }
    setRewards(updatedRewards);
  }

  // add new reward and save
  function addReward() {
    if (rewardName.trim()) {
      const cost = parseInt(rewardCost) || 0;
      if (cost < 1 || cost > 999) {
        setError("Reward cost must be between 1 and 999.");
        return;
      }
      const newRewards = [...rewards, { name: rewardName, cost }];
      setRewards(newRewards);
      setRewardName("");
      setRewardCost("");
      setError("");
      saveData(newRewards, coins);
    }
  }

  // toggle edit mode
  function toggleEdit() {
    if (editMode) {
      saveData(rewards, coins); // save when leaving edit mode
    }
    setEditMode(!editMode);
  }

  // load from storage on startup
  useEffect(() => {
    chrome.storage.sync.get(["coins", "rewards"], (data) => {
      setCoins(data.coins || 0);
      setRewards(data.rewards || []);
    });
  }, []);

  return (
    <div className="w-[420px] p-6 bg-[#f9f6ff] rounded-xl">
      {showConfirm && selectedReward && (
        <ConfirmationPopUp
          message={
            confirmAction === "redeem"
              ? `Redeem "${selectedReward.name}" for ${selectedReward.cost} coins?`
              : `Are you sure you want to delete "${selectedReward.name}"?`
          }
          confirmText={confirmAction === "redeem" ? "Redeem" : "Delete"}
          cancelText="Cancel"
          confirmColor={confirmAction === "redeem" ? "green" : "red"}
          onConfirm={() => {
            if (confirmAction === "redeem") {
              const newCoins = coins - selectedReward.cost;
              setCoins(newCoins);
              saveData(rewards, newCoins);
            } else if (confirmAction === "delete") {
              const updatedRewards = rewards.filter(
                (r) => r !== selectedReward
              );
              setRewards(updatedRewards);
              saveData(updatedRewards, coins);
            }
            setShowConfirm(false);
            setSelectedReward(null);
            setConfirmAction(null);
          }}
          onCancel={() => {
            setShowConfirm(false);
            setSelectedReward(null);
            setConfirmAction(null);
          }}
        />
      )}

      {/* Tabs */}
      <div className="flex mb-6 gap-2">
        <button
          onClick={() => setView("tasks")}
          className="flex-1 py-2 rounded-lg font-medium transition
            bg-gray-200 text-black hover:bg-gray-300"
        >
          Tasks
        </button>
        <button
          disabled
          className="flex-1 py-2 rounded-lg font-medium
            bg-purple-500 text-white"
        >
          Shop
        </button>
      </div>

      {/* Coin Counter + Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <img
            src="icons/coin.png"
            alt="coin"
            className={`w-8 h-8 ${animate ? "coin-animate" : ""}`}
          />
          <h2 className="text-2xl font-bold">{coins}</h2>
          {coinChange && (
            <span
              key={coinChange.id}
              className={`coin-change ml-2 text-lg font-semibold ${
                coinChange.amount > 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {coinChange.amount > 0
                ? `+${coinChange.amount}`
                : coinChange.amount}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={toggleEdit}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
          >
            {editMode ? "Done" : "Edit Mode"}
          </button>

          {/* Toggle Add Reward */}
          <button
            onClick={() => {
              const el1 = document.getElementById("reward-name");
              const el2 = document.getElementById("reward-cost");
              if (showAddReward) {
                if (el1) el1.value = "";
                if (el2) el2.value = "";
                setError("");
              }
              setShowAddReward(!showAddReward);
            }}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
          >
            {showAddReward ? "Done" : "Add Reward"}
          </button>
        </div>
      </div>

      {/* Add Reward Row (toggleable) */}
      {showAddReward && (
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            id="reward-name"
            placeholder="Reward name"
            value={rewardName}
            onChange={(e) => setRewardName(e.target.value)}
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="number"
            id="reward-cost"
            min="1"
            max="999"
            placeholder="Cost"
            value={rewardCost}
            onChange={(e) => setRewardCost(e.target.value)}
            className="w-24 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            id="add-reward"
            onClick={addReward}
            className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition"
          >
            Add
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Rewards List */}
      <ul className="mb-6">{renderRewards()}</ul>
    </div>
  );
}

export default ShopPage;

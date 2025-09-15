import { useState, useEffect } from "react";
import ConfirmationPopUp from "./ConfirmationPopUp";

function RewardsList({ setView, coins, setCoins }) {
  // initialization of variables
  const [rewards, setRewards] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [rewardName, setRewardName] = useState("");
  const [rewardCost, setRewardCost] = useState("");
  const [error, setError] = useState(""); // holds error messages

  // confirmation popup state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // "redeem" or "delete"
  const [selectedReward, setSelectedReward] = useState(null);

  const [animate, setAnimate] = useState(false);

    useEffect(() => {
      setAnimate(true);
      const timeout = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timeout);
  }, [coins]);

  // render rewards in the list
  function renderRewards() {
    return rewards.map((reward, index) => {
      return (
        <li
          key={index}
          className="flex items-center justify-between bg-white p-2 mb-2 rounded shadow-sm"
        >
          {!editMode && (
            <>
              {reward.name} - {reward.cost} coins
              <button
                className="bg-green-500 text-white px-2 py-1 rounded 
    hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={coins < reward.cost}
                onClick={() => {
                  setSelectedReward(reward);
                  setConfirmAction("redeem");
                  setShowConfirm(true);
                }}
              >
                Redeem
              </button>
            </>
          )}
          {/* Edit mode: edit and delete buttons */}
          {editMode && (
            <div className="flex gap-2 w-full">
              <input
                type="text"
                value={reward.name}
                onChange={(e) => updateReward(index, "name", e.target.value)}
                className="flex-1 border rounded px-2 py-1"
              />
              <input
                type="number"
                value={reward.cost}
                min="1"
                max="999"
                onChange={(e) =>
                  updateReward(index, "cost", parseInt(e.target.value))
                }
                className="w-20 border rounded px-2 py-1"
              />
              <button
                onClick={() => {
                  setSelectedReward(reward);
                  setConfirmAction("delete");
                  setShowConfirm(true);
                }}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
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
      setRewardName(""); // clear inputs
      setRewardCost("");
      setError("");
      saveData(newRewards, coins);
    }
  }

  // back to main popup
  function openTaskList() {
    setView("tasks");
  }

  // toggle edit mode
  function toggleEdit() {
    if (editMode) {
      // exit edit mode and save all changes
      saveData(rewards, coins);
    }

    // flip mode
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
    <div className="p-4 bg-gray-50 rounded-lg">
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

      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <img
          src="icons/coin.png"
          alt="coin"
          className={`w-6 h-6 ${animate ? "coin-pop" : ""}`}
        />
        {coins}
      </h2>

      <ul className="mb-4">{renderRewards()}</ul>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          id="reward-name"
          placeholder="Reward name"
          value={rewardName}
          onChange={(e) => setRewardName(e.target.value)}
          className="flex-1 border rounded px-2 py-1"
        />
        <input
          type="number"
          id="reward-cost"
          min="1"
          max="999"
          placeholder="Cost"
          value={rewardCost}
          onChange={(e) => setRewardCost(e.target.value)}
          className="w-20 border rounded px-2 py-1"
        />
        <button
          id="add-reward"
          onClick={addReward}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <div className="flex gap-2">
        <button
          id="back-to-popup"
          onClick={() => setView("tasks")}
          className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
        >
          Back
        </button>
        <button
          id="toggle-edit"
          onClick={toggleEdit}
          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
        >
          {editMode ? "Done" : "Edit Mode"}
        </button>
      </div>
    </div>
  );
}

export default RewardsList;

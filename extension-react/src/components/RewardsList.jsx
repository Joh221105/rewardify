import { useState, useEffect } from "react";

function RewardsList({setView, coins, setCoins}) {
  // initialization of variables
  const [rewards, setRewards] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [rewardName, setRewardName] = useState("");
  const [rewardCost, setRewardCost] = useState("");

  // render rewards in the list
  function renderRewards() {
    return rewards.map((reward, index) => {
      return (
        <li key={index}>
          {reward.name} - {reward.cost} coins{" "}
          {/* create redeem button */}
          {!editMode && (
            <>
              <button
                disabled={coins < reward.cost} // gray out / disable redeem button if not enough coins
                onClick={() => {
                  // redeem reward click handler
                  const confirmed = confirm(
                    `Redeem "${reward.name}" for ${reward.cost} coins?`
                  );
                  if (confirmed) {
                    const newCoins = coins - reward.cost; // subtract cost
                    setCoins(newCoins);
                    saveData(rewards, newCoins); // update storage and refresh UI
                  }
                }}
              >
                Redeem
              </button>
            </>
          )}
          {/* Edit mode: edit and delete buttons */}
          {editMode && (
            <>
              <input
                type="text"
                value={reward.name}
                onChange={(e) => updateReward(index, "name", e.target.value)}
              />
              <input
                type="number"
                value={reward.cost}
                onChange={(e) =>
                  updateReward(index, "cost", parseInt(e.target.value))
                }
              />
              <button
                onClick={() => {
                  const confirmed = confirm(
                    `Are you sure you want to delete "${reward.name}"?`
                  );
                  if (confirmed) {
                    const updatedRewards = rewards.filter((_, i) => i !== index);
                    setRewards(updatedRewards);
                    saveData(updatedRewards, coins);
                  }
                }}
              >
                Delete
              </button>
            </>
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
    updatedRewards[index][field] = value;
    setRewards(updatedRewards);
  }

  // add new reward and save
  function addReward() {
    if (rewardName.trim()) {
      const newRewards = [
        ...rewards,
        { name: rewardName, cost: parseInt(rewardCost) || 0 },
      ];
      setRewards(newRewards);
      setRewardName(""); // clear inputs
      setRewardCost("");
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

    // flip mode and rerender
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
    <div>
      <h2>Coins: {coins}</h2>
      <ul>{renderRewards()}</ul>
      <input
        type="text"
        id="reward-name"
        placeholder="Reward name"
        value={rewardName}
        onChange={(e) => setRewardName(e.target.value)}
      />
      <input
        type="number"
        id="reward-cost"
        placeholder="Cost"
        value={rewardCost}
        onChange={(e) => setRewardCost(e.target.value)}
      />
      <button id="add-reward" onClick={addReward}>
        Add Reward
      </button>
      <button id="back-to-popup" onClick={openTaskList}>
        Back
      </button>
      <button id="toggle-edit" onClick={toggleEdit}>
        {editMode ? "Done" : "Edit Mode"}
      </button>
    </div>
  );
}

export default RewardsList;

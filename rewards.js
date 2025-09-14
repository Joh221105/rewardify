let coins = 0;
let rewards = [];

const coinCount = document.getElementById("coin-count");
const rewardList = document.getElementById("reward-list");


// render rewards in the list
function renderRewards() {
  rewardList.innerHTML = ""; // clear existing

  rewards.forEach((reward, index) => {
    const li = document.createElement("li");
    li.textContent = `${reward.name} - ${reward.cost} coins `;

    // create redeem button
    const redeemBtn = document.createElement("button");
    redeemBtn.textContent = "Redeem";

    // reedeem click handler
    redeemBtn.addEventListener("click", () => {
      if (coins >= reward.cost) {
        coins -= reward.cost;          // subtract cost
        alert(`You redeemed: ${reward.name}!`); // confirmation (MVP style)
        saveData();                    // update storage and refresh UI
      } else {
        alert("Not enough coins!");
      }
    });

    li.appendChild(redeemBtn);
    rewardList.appendChild(li);
  });
}


// save rewards and coins to chrome storage and re-render
function saveData() {
  chrome.storage.sync.set({ coins, rewards }, () => {
    coinCount.textContent = coins;
    renderRewards();
  });
}

// add new reward and save
document.getElementById("add-reward").addEventListener("click", () => {
  const rewardNameInput = document.getElementById("reward-name");
  const rewardCostInput = document.getElementById("reward-cost");

  if (rewardNameInput.value.trim()) {
    rewards.push({ 
      name: rewardNameInput.value, 
      cost: parseInt(rewardCostInput.value) || 0 
    });

    // clear inputs
    rewardNameInput.value = "";
    rewardCostInput.value = "";

    saveData();
  }
});


// back to main popup
document.getElementById("back-to-popup").addEventListener("click", () => {
    window.location.href = "popup.html";
  });

// load from storage on startup
chrome.storage.sync.get(["coins", "rewards"], (data) => {
  coins = data.coins || 0;
  rewards = data.rewards || [];
  coinCount.textContent = coins;
  renderRewards();
});



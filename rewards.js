let coins = 0;
let rewards = [];
let editMode = false;

const coinCount = document.getElementById("coin-count");
const rewardList = document.getElementById("reward-list");

// render rewards in the list
function renderRewards() {
  rewardList.innerHTML = ""; // clear existing

  rewards.forEach((reward, index) => {
    const li = document.createElement("li");
    li.textContent = `${reward.name} - ${reward.cost} coins `;

    // create redeem button

    if (!editMode) {
      const redeemBtn = document.createElement("button");
      redeemBtn.textContent = "Redeem";

      // gray out / disable redeem button if not enough coins
      if (coins < reward.cost) {
        redeemBtn.disabled = true;
      }

      // redeem reward click handler
      redeemBtn.addEventListener("click", () => {
        const confirmed = confirm(
          `Redeem "${reward.name}" for ${reward.cost} coins?`
        );
        if (confirmed) {
          coins -= reward.cost; // subtract cost
          saveData(); // update storage and refresh UI
        }
      });

      li.appendChild(redeemBtn);
    }
    // Edit mode: edit and delete buttons
    if (editMode) {
      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = reward.name;
      nameInput.dataset.index = index; // store index for later lookup

      const costInput = document.createElement("input");
      costInput.type = "number";
      costInput.value = reward.cost;
      costInput.dataset.index = index;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        const confirmed = confirm(
          `Are you sure you want to delete "${reward.name}"?`
        );
        if (confirmed) {
          rewards.splice(index, 1);
          saveData();
        }
      });

      li.appendChild(nameInput);
      li.appendChild(costInput);
      li.appendChild(deleteBtn);
    }

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
      cost: parseInt(rewardCostInput.value) || 0,
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

// toggle edit mode
document.getElementById("toggle-edit").addEventListener("click", () => {
  if (editMode) {
    // exit edit mode and save all changes
    const nameInputs = document.querySelectorAll(
      "input[type='text'][data-index]"
    );
    const costInputs = document.querySelectorAll(
      "input[type='number'][data-index]"
    );

    nameInputs.forEach((input) => {
      const i = input.dataset.index;
      rewards[i].name = input.value.trim() || rewards[i].name;
    });

    costInputs.forEach((input) => {
      const i = input.dataset.index;
      rewards[i].cost = parseInt(input.value) || rewards[i].cost;
    });

    saveData();
  }

  // flip mode and rerender
  editMode = !editMode;
  document.getElementById("toggle-edit").textContent = editMode
    ? "Done"
    : "Edit Mode";
  renderRewards();
});

// load from storage on startup
chrome.storage.sync.get(["coins", "rewards"], (data) => {
  coins = data.coins || 0;
  rewards = data.rewards || [];
  coinCount.textContent = coins;
  renderRewards();
});

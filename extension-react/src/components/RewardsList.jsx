function RewardsList({ setView }) {
  return (
    <div className="w-[420px] p-6 bg-[#f9f6ff] rounded-xl">
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
          Rewards
        </button>
      </div>

      {/* Rewards List: holds buttons to different types of rewards */}
      <h2 className="text-xl font-bold mb-6">Rewards</h2>

      <div className="flex flex-col gap-4">
        {/* Navigate to ShopPage */}
        <button
          onClick={() => setView("shop")}
          className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
        >
          Go to Shop
        </button>
      </div>
    </div>
  );
}

export default RewardsList;

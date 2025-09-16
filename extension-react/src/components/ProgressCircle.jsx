function ProgressCircle({ progress }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <svg width="160" height="160" className="mb-4">
      <circle
        stroke="#e5e7eb" // gray background
        fill="transparent"
        strokeWidth="10"
        r={radius}
        cx="80"
        cy="80"
      />
      <circle
        stroke="#10b981" // green progress
        fill="transparent"
        strokeWidth="10"
        strokeLinecap="round"
        r={radius}
        cx="80"
        cy="80"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s linear" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        className="text-3xl font-mono font-bold fill-gray-800"
      >
        {progress === 0 ? "00:00" : ""}
      </text>
    </svg>
  );
}

import { useState } from "react";

const AchievementsTab = () => {
  const [achievements, ] = useState([
    {
      id: 1,
      title: "First Workout",
      description: "Completed your very first workout!",
      unlocked: true,
      dateUnlocked: "2025-05-15",
      icon: "🏅",
    },
    {
      id: 2,
      title: "5-Day Streak",
      description: "Train 5 days in a row to unlock",
      unlocked: false,
      progress: 3,
      goal: 5,
      icon: "🔥",
    },
    {
      id: 3,
      title: "Goal Reached - Lose 5kg",
      description: "You reached your weight loss goal!",
      unlocked: true,
      dateUnlocked: "2025-05-10",
      icon: "🏆",
    },
  ]);

  return (
    <div className="p-4 max-w-4xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-6">🎯 Achievements</h2>

      <div className="space-y-6">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`p-4 rounded shadow-md border ${
              ach.unlocked ? "border-green-500 bg-gray-800" : "border-gray-600 bg-gray-900 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold flex items-center gap-2">
                {ach.icon} {ach.title}
              </h3>
              {ach.unlocked ? (
                <span className="text-green-400 text-sm">✅ Unlocked</span>
              ) : (
                <span className="text-yellow-400 text-sm">🔒 Locked</span>
              )}
            </div>

            <p className="text-gray-300 text-sm">{ach.description}</p>

            {ach.unlocked && ach.dateUnlocked && (
              <p className="text-xs text-gray-400 mt-1">
                📅 Unlocked on {ach.dateUnlocked}
              </p>
            )}

            {!ach.unlocked && ach.progress !== undefined && (
              <div className="mt-2">
                <div className="h-2 bg-gray-700 rounded-full">
                  <div
                    className="h-2 bg-yellow-500 rounded-full"
                    style={{
                      width: `${(ach.progress / ach.goal) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Progress: {ach.progress} / {ach.goal}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsTab;

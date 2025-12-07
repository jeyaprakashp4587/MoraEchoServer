import User from "../models/User.js";

// Helper function to get today's date string (YYYY-MM-DD)
const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Helper function to check and reset todos for new day
const checkAndResetTodos = (goal) => {
  const today = getTodayDateString();

  // If lastCheckedDate is null or different from today, reset todos
  if (!goal.lastCheckedDate || goal.lastCheckedDate !== today) {
    // Check if yesterday was completed
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const yesterdayRecord = goal.completionHistory?.find(
      (h) => h.date === yesterdayStr && h.completed === true
    );

    // If yesterday was not completed and we're past yesterday, reset streak
    if (!yesterdayRecord && goal.lastCheckedDate && goal.lastCheckedDate !== yesterdayStr) {
      // Reset streak if missed a day (only if we had a previous date)
      goal.goalStreak = 0;
    }
    // Note: Streak increment happens in completeTodo when at least one todo is completed
    // We don't increment here, we just maintain or reset it

    // Reset all todos for new day
    goal.goalTodos.forEach((todo) => {
      todo.completed = false;
    });

    goal.isToday = true;
    goal.lastCheckedDate = today;
  }

  return goal;
};

export const createGoal = async (req, res) => {
  try {
    const { goalTitle, goalTodos } = req.body;

    if (!goalTitle || !goalTitle.trim()) {
      return res.status(400).json({ error: "Goal title is required" });
    }

    if (!goalTodos || !Array.isArray(goalTodos) || goalTodos.length === 0) {
      return res.status(400).json({ error: "At least one todo is required" });
    }

    const today = getTodayDateString();

    const newGoal = {
      goalTitle: goalTitle.trim(),
      goalStreak: 0,
      goalTodos: goalTodos.map((todo) => ({
        todoName:
          typeof todo === "string" ? todo.trim() : todo.todoName?.trim(),
        completed: false,
      })),
      isToday: true,
      lastCheckedDate: today,
      completionHistory: [],
      createdAt: new Date(),
    };

    // Use findOneAndUpdate to handle type migration from array to object
    // This bypasses Mongoose's strict type checking and directly updates MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: { goals: newGoal } },
      { new: true, runValidators: false }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(201).json({
      message: "Goal created successfully",
      goal: updatedUser.goals,
    });
  } catch (error) {
    console.error("Error creating goal:", error);
    return res.status(500).json({ error: "Failed to create goal" });
  }
};

export const getGoals = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("goals");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Handle migration: if goals is an array, convert to object (use first/latest goal)
    if (Array.isArray(user.goals) && user.goals.length > 0) {
      // Get the latest goal from the array
      const latestGoal = user.goals[user.goals.length - 1];
      // Convert to object structure
      user.set('goals', latestGoal);
      user.markModified('goals');
      await user.save();
    }

    if (!user.goals || (Array.isArray(user.goals) && user.goals.length === 0)) {
      return res.status(200).json({
        goal: null,
        streakRewardAwarded: false,
      });
    }

    // Check and reset todos if it's a new day
    const updatedGoal = checkAndResetTodos(user.goals);

    // Save if goal was updated
    let needsSave = false;
    let streakRewardAwarded = false;

    if (user.goals.lastCheckedDate !== updatedGoal.lastCheckedDate) {
      user.goals.goalStreak = updatedGoal.goalStreak;
      user.goals.isToday = updatedGoal.isToday;
      user.goals.lastCheckedDate = updatedGoal.lastCheckedDate;
      user.goals.goalTodos = updatedGoal.goalTodos;
      needsSave = true;
    }

    // Check if streak reward is pending and award it
    if (user.goals.streakRewardPending) {
      user.amount = (user.amount || 0) + 100;
      user.goals.streakRewardPending = false;
      streakRewardAwarded = true;
      needsSave = true;
    }

    if (needsSave) {
      await user.save();
    }

    return res.status(200).json({
      goal: user.goals,
      streakRewardAwarded: streakRewardAwarded,
    });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return res.status(500).json({ error: "Failed to fetch goals" });
  }
};

export const completeTodo = async (req, res) => {
  try {
    const { todoIndex } = req.body;

    if (todoIndex === undefined) {
      return res
        .status(400)
        .json({ error: "Todo index is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.goals) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const goal = user.goals;

    // Check and reset if new day
    checkAndResetTodos(goal);

    if (todoIndex < 0 || todoIndex >= goal.goalTodos.length) {
      return res.status(400).json({ error: "Invalid todo index" });
    }

    const todo = goal.goalTodos[todoIndex];
    if (todo.completed) {
      return res.status(400).json({ error: "Todo already completed" });
    }

    // Mark todo as completed
    todo.completed = true;

    // Add 5 coins reward
    user.amount = (user.amount || 0) + 5;

    const today = getTodayDateString();
    
    // Check if today was already marked as completed in history
    const existingRecord = goal.completionHistory?.find(
      (h) => h.date === today
    );

    // Only increment streak if this is the first todo completed today
    // (i.e., today wasn't already marked as completed)
    if (!existingRecord) {
      if (!goal.completionHistory) {
        goal.completionHistory = [];
      }
      // Mark today as completed (at least one todo is done)
      goal.completionHistory.push({ date: today, completed: true });

      // Increment streak when at least one todo is completed today
      const newStreak = (goal.goalStreak || 0) + 1;

      // If streak reaches 7, reset to 0 and mark for 100 coins reward
      if (newStreak >= 7) {
        goal.goalStreak = 0;
        goal.streakRewardPending = true; // Flag to give 100 coins on next getGoals call
      } else {
        goal.goalStreak = newStreak;
      }
    } else if (existingRecord && !existingRecord.completed) {
      // If record exists but wasn't completed, mark it as completed now
      existingRecord.completed = true;

      // Increment streak since this is the first time completing today
      const newStreak = (goal.goalStreak || 0) + 1;

      // If streak reaches 7, reset to 0 and mark for 100 coins reward
      if (newStreak >= 7) {
        goal.goalStreak = 0;
        goal.streakRewardPending = true; // Flag to give 100 coins on next getGoals call
      } else {
        goal.goalStreak = newStreak;
      }
    }

    await user.save();

    const allCompleted = goal.goalTodos.every((t) => t.completed);

    return res.status(200).json({
      message: "Todo completed successfully",
      goal: goal,
      allCompleted: allCompleted,
      coinsReward: 5,
      newAmount: user.amount,
    });
  } catch (error) {
    console.error("Error completing todo:", error);
    return res.status(500).json({ error: "Failed to complete todo" });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.goals) {
      return res.status(404).json({ error: "Goal not found" });
    }

    user.goals = null;
    await user.save();

    return res.status(200).json({
      message: "Goal deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return res.status(500).json({ error: "Failed to delete goal" });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const { todoIndex } = req.body;

    if (todoIndex === undefined) {
      return res
        .status(400)
        .json({ error: "Todo index is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.goals) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const goal = user.goals;

    if (todoIndex < 0 || todoIndex >= goal.goalTodos.length) {
      return res.status(400).json({ error: "Invalid todo index" });
    }

    if (goal.goalTodos.length <= 1) {
      return res.status(400).json({
        error: "Cannot delete the last todo. Delete the goal instead.",
      });
    }

    goal.goalTodos.splice(todoIndex, 1);
    await user.save();

    return res.status(200).json({
      message: "Todo deleted successfully",
      goal: goal,
    });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return res.status(500).json({ error: "Failed to delete todo" });
  }
};

export const addTodoToGoal = async (req, res) => {
  try {
    const { todoName } = req.body;

    if (!todoName || !todoName.trim()) {
      return res
        .status(400)
        .json({ error: "Todo name is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.goals) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const goal = user.goals;

    goal.goalTodos.push({
      todoName: todoName.trim(),
      completed: false,
    });

    await user.save();

    return res.status(200).json({
      message: "Todo added successfully",
      goal: goal,
    });
  } catch (error) {
    console.error("Error adding todo:", error);
    return res.status(500).json({ error: "Failed to add todo" });
  }
};

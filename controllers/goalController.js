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

    if (yesterdayRecord) {
      // Increment streak if yesterday was completed
      const newStreak = (goal.goalStreak || 0) + 1;

      // If streak reaches 7, reset to 0 and mark for 100 coins reward
      if (newStreak >= 7) {
        goal.goalStreak = 0;
        goal.streakRewardPending = true; // Flag to give 100 coins
      } else {
        goal.goalStreak = newStreak;
      }
    } else if (goal.lastCheckedDate && goal.lastCheckedDate !== yesterdayStr) {
      // Reset streak if missed a day
      goal.goalStreak = 0;
    }

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

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
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

    user.goals.push(newGoal);
    await user.save();

    const createdGoal = user.goals[user.goals.length - 1];

    return res.status(201).json({
      message: "Goal created successfully",
      goal: createdGoal,
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

    // Check and reset todos for each goal if it's a new day
    const updatedGoals = user.goals.map((goal) => {
      return checkAndResetTodos(goal);
    });

    // Save if any goals were updated
    let needsSave = false;
    let streakRewardAwarded = false;

    user.goals.forEach((goal, index) => {
      if (goal.lastCheckedDate !== updatedGoals[index].lastCheckedDate) {
        goal.goalStreak = updatedGoals[index].goalStreak;
        goal.isToday = updatedGoals[index].isToday;
        goal.lastCheckedDate = updatedGoals[index].lastCheckedDate;
        goal.goalTodos = updatedGoals[index].goalTodos;
        needsSave = true;
      }
    });

    if (needsSave) {
      await user.save();
    }

    return res.status(200).json({
      goals: user.goals || [],
      streakRewardAwarded: streakRewardAwarded,
    });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return res.status(500).json({ error: "Failed to fetch goals" });
  }
};

export const completeTodo = async (req, res) => {
  try {
    const { goalId, todoIndex } = req.body;

    if (!goalId || todoIndex === undefined) {
      return res
        .status(400)
        .json({ error: "Goal ID and todo index are required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const goal = user.goals.id(goalId);
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

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

    // Add 10 coins reward
    user.amount = (user.amount || 0) + 5;

    // Check if all todos are completed
    const allCompleted = goal.goalTodos.every((t) => t.completed);
    const today = getTodayDateString();

    if (allCompleted) {
      // Update completion history
      const existingRecord = goal.completionHistory?.find(
        (h) => h.date === today
      );

      // Only increment streak if today wasn't already marked as completed
      if (!existingRecord) {
        if (!goal.completionHistory) {
          goal.completionHistory = [];
        }
        goal.completionHistory.push({ date: today, completed: true });

        // Increment streak immediately when all todos are completed today
        const newStreak = (goal.goalStreak || 0) + 1;

        // If streak reaches 7, reset to 0 and add 100 coins reward
        if (newStreak >= 7) {
          goal.goalStreak = 0;
          user.amount = (user.amount || 0) + 100; // Add 100 coins immediately
        } else {
          goal.goalStreak = newStreak;
        }
      } else if (existingRecord && !existingRecord.completed) {
        // If record exists but wasn't completed, mark it as completed now
        existingRecord.completed = true;

        // Increment streak since this is the first time completing today
        const newStreak = (goal.goalStreak || 0) + 1;

        // If streak reaches 7, reset to 0 and add 100 coins reward
        if (newStreak >= 7) {
          goal.goalStreak = 0;
          user.amount = (user.amount || 0) + 100; // Add 100 coins immediately
        } else {
          goal.goalStreak = newStreak;
        }
      }
    }

    await user.save();

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
    const { goalId } = req.body;

    if (!goalId) {
      return res.status(400).json({ error: "Goal ID is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const goal = user.goals.id(goalId);
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    user.goals.pull(goalId);
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
    const { goalId, todoIndex } = req.body;

    if (!goalId || todoIndex === undefined) {
      return res
        .status(400)
        .json({ error: "Goal ID and todo index are required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const goal = user.goals.id(goalId);
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

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
    const { goalId, todoName } = req.body;

    if (!goalId || !todoName || !todoName.trim()) {
      return res
        .status(400)
        .json({ error: "Goal ID and todo name are required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const goal = user.goals.id(goalId);
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

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

// Budget Periods
export const BudgetPeriod = {
  WEEKLY: 0,
  MONTHLY: 1,
  YEARLY: 2,
  CUSTOM: 3,
};

export const BudgetPeriodLabels = {
  [BudgetPeriod.WEEKLY]: "Weekly",
  [BudgetPeriod.MONTHLY]: "Monthly",
  [BudgetPeriod.YEARLY]: "Yearly",
  [BudgetPeriod.CUSTOM]: "Custom",
};

// Category Types
export const CategoryType = {
  EXPENSE: 0,
  INCOME: 1,
};

export const CategoryTypeLabels = {
  [CategoryType.EXPENSE]: "Expense",
  [CategoryType.INCOME]: "Income",
};

// Transaction Types
export const TransactionType = {
  EXPENSE: 0,
  INCOME: 1,
};

export const TransactionTypeLabels = {
  [TransactionType.EXPENSE]: "Expense",
  [TransactionType.INCOME]: "Income",
};

// Category Icons (default options)
export const CategoryIcons = [
  "🏠",
  "🛒",
  "🚗",
  "✈️",
  "🎬",
  "🍔",
  "☕",
  "💊",
  "👕",
  "📚",
  "💼",
  "🎓",
  "🏋️",
  "🎮",
  "🎨",
  "🎵",
  "💰",
  "💵",
  "💳",
  "🏦",
  "📱",
  "💻",
  "🔧",
  "🌳",
];

// Category Colors (default options)
export const CategoryColors = [
  "#667eea", // Primary purple
  "#764ba2", // Primary dark purple
  "#38a169", // Green
  "#e53e3e", // Red
  "#f59e0b", // Orange
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#f97316", // Deep orange
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#a855f7", // Violet
  "#ef4444", // Bright red
  "#795548", // Brown
];

// Progress Bar Color Thresholds
export const ProgressColors = {
  LOW: "#38a169", // Green (0-60%)
  MEDIUM: "#f59e0b", // Orange (60-90%)
  HIGH: "#e53e3e", // Red (90-100%+)
};

export const getProgressColor = (percentage) => {
  if (percentage >= 90) return ProgressColors.HIGH;
  if (percentage >= 60) return ProgressColors.MEDIUM;
  return ProgressColors.LOW;
};

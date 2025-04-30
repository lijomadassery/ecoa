// Fix spread operator issue
const data = Object.assign({}, baseData);

// Fix unknown type issues
interface Stats {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  inProgressCount: number;
}

const stats = result as Stats;
return res.json({
  totalTasks: stats.totalCount,
  completed: stats.completedCount,
  pending: stats.pendingCount,
  inProgress: stats.inProgressCount
}); 
import { query } from "~/convex/_generated/server";

export const getCompletedTasks = query({
  handler: async (ctx) => {
    const completedTasks = await ctx.db
      .query("todoKanban")
      .filter((q) => q.eq(q.field("column"), "done"))
      .collect();
    return completedTasks;
  },
});

export const getCompletedTasksByDate = query({
  handler: async (ctx) => {
    // First, get all completed tasks
    const completedTasks = await ctx.db
      .query("todoKanban")
      .filter((q) => q.eq(q.field("column"), "done"))
      .collect();

    // Define the type for our groups object
    type TaskGroups = Record<string, typeof completedTasks>;

    // Group tasks by date (handling undefined updatedAt values)
    const tasksByDate = completedTasks.reduce((groups: TaskGroups, task) => {
      // Handle case where updatedAt might be undefined
      const timestamp = task.updatedAt ?? task._creationTime;
      const date = new Date(timestamp).toISOString().split("T")[0];

      // Create the group if it doesn't exist
      if (!groups[date]) {
        groups[date] = [];
      }

      // Add the task to its date group
      groups[date].push(task);

      return groups;
    }, {} as TaskGroups); // Type assertion here

    // Convert to array format if preferred
    const groupedResult = Object.entries(tasksByDate).map(([date, tasks]) => ({
      date,
      tasks,
    }));

    return groupedResult;
  },
});

export const getCompletedTasksChangelog = query({
  handler: async (ctx) => {
    const completedTasks = await ctx.db
      .query("todoKanban")
      .filter((q) => q.eq(q.field("column"), "done"))
      .filter((q) => q.eq(q.field("public"), true))
      .collect();

    const sorted = completedTasks
      .map((task) => ({
        ...task,
        timestamp: new Date(task.completedAt ?? task._creationTime),
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const groupedByMonth: Record<string, { subtitle: string; text: string[] }> =
      {};

    for (const task of sorted) {
      const monthLabel = task.timestamp.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      const dayLabel = `${task.timestamp.getMonth() + 1}.${task.timestamp.getDate()}`;

      const entry = `${dayLabel}: ${task.title}`;

      if (!groupedByMonth[monthLabel]) {
        groupedByMonth[monthLabel] = {
          subtitle: monthLabel,
          text: [],
        };
      }

      groupedByMonth[monthLabel].text.push(entry);
    }

    // Convert back to array and preserve sort order
    const result = Object.values(groupedByMonth);

    return result;
  },
});

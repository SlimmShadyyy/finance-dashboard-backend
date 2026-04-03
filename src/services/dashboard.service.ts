// src/services/dashboard.service.ts
import { prisma } from '../prisma';

export const getDashboardSummary = async (userId: string) => {
  // 1. Get totals via database aggregation
  const totals = await prisma.record.groupBy({
    by: ['type'],
    where: { userId },
    _sum: { amount: true },
  });

  let totalIncome = 0;
  let totalExpense = 0;

  totals.forEach(t => {
    if (t.type === 'INCOME') totalIncome = t._sum.amount || 0;
    if (t.type === 'EXPENSE') totalExpense = t._sum.amount || 0;
  });

  // 2. Get category-wise totals for expenses
  const categoryTotals = await prisma.record.groupBy({
    by: ['category'],
    where: { userId, type: 'EXPENSE' },
    _sum: { amount: true },
  });

  // 3. Calculate Monthly Trends (Last 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const trendRecords = await prisma.record.findMany({
    where: {
      userId,
      date: { gte: sixMonthsAgo }
    },
    select: { amount: true, type: true, date: true }
  });

  // Group the fetched records by Month (YYYY-MM)
  const monthlyData: Record<string, { income: number; expense: number }> = {};

  trendRecords.forEach(record => {
    // Convert date to "YYYY-MM" string to group them easily
    const monthYear = record.date.toISOString().substring(0, 7); 
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { income: 0, expense: 0 };
    }
    
    if (record.type === 'INCOME') {
      monthlyData[monthYear].income += record.amount;
    } else {
      monthlyData[monthYear].expense += record.amount;
    }
  });

  // Convert the grouped object into a sorted array for the frontend
  const monthlyTrends = Object.keys(monthlyData)
    .sort() // Sorts chronologically (e.g., 2026-01, 2026-02)
    .map(month => ({
      month,
      income: monthlyData[month].income,
      expense: monthlyData[month].expense
    }));

  // 4. Fetch 5 most recent activities
  const recentActivity = await prisma.record.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 5,
  });

  return {
    netBalance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
    categoryTotals: categoryTotals.map(c => ({
      category: c.category,
      total: c._sum.amount
    })),
    monthlyTrends,
    recentActivity
  };
};
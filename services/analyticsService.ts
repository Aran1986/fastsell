
import { Order } from '../types';

export const AnalyticsService = {
  getTrafficStats(orders: Order[]) {
    const stats: Record<string, number> = {};
    orders.forEach(o => {
      const src = o.trafficSource || 'Direct';
      stats[src] = (stats[src] || 0) + 1;
    });

    const total = orders.length || 1;
    return Object.entries(stats)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  },

  getSalesByDay(orders: Order[]) {
    const days: Record<string, number> = {};
    orders.forEach(o => {
      const date = new Date(o.date).toLocaleDateString('fa-IR', { weekday: 'long' });
      days[date] = (days[date] || 0) + o.totalPaid;
    });
    return Object.entries(days);
  },

  getConversionRate(totalVisitors: number, totalOrders: number) {
    if (totalVisitors === 0) return 0;
    return ((totalOrders / totalVisitors) * 100).toFixed(1);
  }
};

'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { type DashboardStats } from '@/lib/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface AnalyticsChartsProps {
  stats: DashboardStats;
}

const COLORS = {
  open: 'oklch(0.55 0.22 200)',
  pending: 'oklch(0.75 0.15 60)',
  in_progress: 'oklch(0.65 0.25 280)',
  resolved: 'oklch(0.7 0.2 150)',
  closed: 'oklch(0.4 0.02 280)',
};

const PRIORITY_COLORS = {
  low: 'oklch(0.55 0.22 200)',
  medium: 'oklch(0.75 0.15 60)',
  high: 'oklch(0.65 0.2 30)',
  urgent: 'oklch(0.55 0.22 25)',
};

// Custom tooltip component
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 rounded-lg border border-border/50">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-lg font-bold text-primary">{payload[0].value} tickets</p>
      </div>
    );
  }
  return null;
}

export function TicketTrendChart({ data }: { data: DashboardStats['ticketsTrend'] }) {
  return (
    <GlassCard delay={0.2} className="h-[350px]">
      <motion.h3
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-lg font-semibold text-foreground mb-4"
      >
        Ticket Volume Trend
      </motion.h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="ticketGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.65 0.25 280)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="oklch(0.65 0.25 280)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.35 0.03 280 / 0.3)" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            axisLine={{ stroke: 'oklch(0.35 0.03 280 / 0.3)' }}
          />
          <YAxis
            tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
            axisLine={{ stroke: 'oklch(0.35 0.03 280 / 0.3)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="oklch(0.65 0.25 280)"
            strokeWidth={3}
            fill="url(#ticketGradient)"
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}

export function TicketsByStatusChart({ data }: { data: DashboardStats['ticketsByStatus'] }) {
  const chartData = data.map((item) => ({
    ...item,
    name: item.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    fill: COLORS[item.status as keyof typeof COLORS],
  }));

  return (
    <GlassCard delay={0.3} className="h-[350px]">
      <motion.h3
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-lg font-semibold text-foreground mb-4"
      >
        Tickets by Status
      </motion.h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="count"
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="glass-card p-3 rounded-lg border border-border/50">
                    <p className="text-sm font-medium text-foreground">{data.name}</p>
                    <p className="text-lg font-bold" style={{ color: data.fill }}>
                      {data.count} tickets
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}

export function TicketsByPriorityChart({ data }: { data: DashboardStats['ticketsByPriority'] }) {
  const chartData = data.map((item) => ({
    ...item,
    name: item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
    fill: PRIORITY_COLORS[item.priority as keyof typeof PRIORITY_COLORS],
  }));

  return (
    <GlassCard delay={0.4} className="h-[350px]">
      <motion.h3
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-lg font-semibold text-foreground mb-4"
      >
        Tickets by Priority
      </motion.h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.35 0.03 280 / 0.3)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
            axisLine={{ stroke: 'oklch(0.35 0.03 280 / 0.3)' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
            axisLine={{ stroke: 'oklch(0.35 0.03 280 / 0.3)' }}
            width={60}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="glass-card p-3 rounded-lg border border-border/50">
                    <p className="text-sm font-medium text-foreground">{data.name}</p>
                    <p className="text-lg font-bold" style={{ color: data.fill }}>
                      {data.count} tickets
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="count"
            radius={[0, 8, 8, 0]}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}

export function AnalyticsCharts({ stats }: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <TicketTrendChart data={stats.ticketsTrend} />
      </div>
      <TicketsByStatusChart data={stats.ticketsByStatus} />
      <TicketsByPriorityChart data={stats.ticketsByPriority} />
    </div>
  );
}

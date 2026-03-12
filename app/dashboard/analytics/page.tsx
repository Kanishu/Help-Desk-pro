'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/dashboard/header';
import { StatCard, GlassCard } from '@/components/ui/glass-card';
import {
  TicketTrendChart,
  TicketsByStatusChart,
  TicketsByPriorityChart,
} from '@/components/dashboard/analytics-charts';
import { DEMO_STATS } from '@/lib/types';
import {
  TrendingUp,
  Users,
  Clock,
  Star,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen">
      <Header
        title="Analytics"
        subtitle="Track performance metrics and insights"
      />

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Avg Response Time"
            value={`${DEMO_STATS.avgResponseTime}h`}
            icon={<Clock className="w-16 h-16" />}
            trend={{ value: 15, positive: true }}
            delay={0.1}
          />
          <StatCard
            label="Customer Satisfaction"
            value={`${DEMO_STATS.satisfactionScore}/5`}
            icon={<Star className="w-16 h-16" />}
            trend={{ value: 5, positive: true }}
            delay={0.2}
          />
          <StatCard
            label="Resolution Rate"
            value="91%"
            icon={<Target className="w-16 h-16" />}
            trend={{ value: 3, positive: true }}
            delay={0.3}
          />
          <StatCard
            label="Active Agents"
            value={8}
            icon={<Users className="w-16 h-16" />}
            trend={{ value: 2, positive: true }}
            delay={0.4}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <TicketTrendChart data={DEMO_STATS.ticketsTrend} />
          </div>
          <TicketsByStatusChart data={DEMO_STATS.ticketsByStatus} />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TicketsByPriorityChart data={DEMO_STATS.ticketsByPriority} />
          
          {/* Agent Performance */}
          <GlassCard delay={0.5} className="h-[350px]">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Top Performing Agents
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Sarah Johnson', tickets: 47, satisfaction: 4.9, trend: 12 },
                { name: 'Mike Chen', tickets: 42, satisfaction: 4.8, trend: 8 },
                { name: 'Emma Davis', tickets: 38, satisfaction: 4.7, trend: -3 },
                { name: 'James Wilson', tickets: 35, satisfaction: 4.6, trend: 5 },
                { name: 'Lisa Park', tickets: 31, satisfaction: 4.8, trend: 15 },
              ].map((agent, i) => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground w-6">
                    #{i + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm truncate">{agent.name}</div>
                    <div className="text-xs text-muted-foreground">{agent.tickets} tickets resolved</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-3.5 h-3.5 text-[oklch(0.75_0.15_60)]" />
                      <span className="text-foreground font-medium">{agent.satisfaction}</span>
                    </div>
                    <div className={`text-xs flex items-center gap-0.5 ${agent.trend > 0 ? 'text-[oklch(0.7_0.2_150)]' : 'text-destructive'}`}>
                      {agent.trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(agent.trend)}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SLA Compliance */}
          <GlassCard delay={0.6}>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              SLA Compliance
            </h3>
            <div className="space-y-4">
              {[
                { label: 'First Response', value: 94, target: 90 },
                { label: 'Resolution Time', value: 88, target: 85 },
                { label: 'Customer Reply', value: 91, target: 80 },
              ].map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                >
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">{metric.label}</span>
                    <span className={metric.value >= metric.target ? 'text-[oklch(0.7_0.2_150)]' : 'text-[oklch(0.75_0.15_60)]'}>
                      {metric.value}% (target: {metric.target}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value}%` }}
                      transition={{ delay: 0.8 + i * 0.1, duration: 1 }}
                      className={`h-full rounded-full ${
                        metric.value >= metric.target 
                          ? 'bg-gradient-to-r from-[oklch(0.7_0.2_150)] to-[oklch(0.8_0.15_150)]' 
                          : 'bg-gradient-to-r from-[oklch(0.75_0.15_60)] to-[oklch(0.85_0.12_60)]'
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Channel Distribution */}
          <GlassCard delay={0.7}>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[oklch(0.75_0.15_60)]" />
              Ticket Channels
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Email', value: 45, color: 'from-primary to-primary/60' },
                { label: 'Web Form', value: 30, color: 'from-accent to-accent/60' },
                { label: 'Chat', value: 15, color: 'from-[oklch(0.7_0.2_150)] to-[oklch(0.7_0.2_150_/_0.6)]' },
                { label: 'Phone', value: 10, color: 'from-[oklch(0.75_0.15_60)] to-[oklch(0.75_0.15_60_/_0.6)]' },
              ].map((channel, i) => (
                <motion.div
                  key={channel.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${channel.color}`} />
                  <span className="text-sm text-muted-foreground flex-1">{channel.label}</span>
                  <span className="text-sm font-medium text-foreground">{channel.value}%</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Peak Hours */}
          <GlassCard delay={0.8}>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[oklch(0.7_0.2_150)]" />
              Peak Hours
            </h3>
            <div className="space-y-2">
              {[
                { hour: '9 AM - 11 AM', value: 85 },
                { hour: '2 PM - 4 PM', value: 70 },
                { hour: '11 AM - 1 PM', value: 55 },
                { hour: '4 PM - 6 PM', value: 40 },
              ].map((peak, i) => (
                <motion.div
                  key={peak.hour}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xs text-muted-foreground w-24">{peak.hour}</span>
                  <div className="flex-1 h-4 bg-muted/30 rounded overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${peak.value}%` }}
                      transition={{ delay: 1 + i * 0.1, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-[oklch(0.7_0.2_150)] to-primary rounded"
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground w-8">{peak.value}%</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

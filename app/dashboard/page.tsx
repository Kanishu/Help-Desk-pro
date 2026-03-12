'use client';

import { StatCard } from '@/components/ui/glass-card';
import { TicketList as RecentTickets } from '@/components/dashboard/ticket-list';
import { TicketDetail } from '@/components/dashboard/ticket-detail';
import { CreateTicketModal } from '@/components/dashboard/create-ticket-modal';
import { AnalyticsCharts, TicketTrendChart } from '@/components/dashboard/analytics-charts';
import { Header } from '@/components/dashboard/header';
import { DEMO_STATS, type Ticket, type TicketStatus } from '@/lib/types';
import { useState } from 'react';
import { useTickets } from '@/context/TicketContext';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import {
  Ticket as TicketIcon,
  CheckCircle,
  Clock,
  Zap,
  ArrowUpRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { tickets, loading } = useTickets();
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');

  const filteredTickets = statusFilter === 'all'
    ? tickets
    : tickets.filter(t => t.status === statusFilter);

  // Compute live stats from ticket data
  const openCount = tickets.filter(t => t.status === 'open').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  return (
    <div className="min-h-screen">
      <Header
        title="Dashboard Overview"
        subtitle={`Welcome back, ${user?.name || 'Admin'}`}
        onCreateTicket={() => setIsCreateModalOpen(true)}
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Tickets"
            value={tickets.length}
            icon={<TicketIcon className="w-16 h-16" />}
            trend={{ value: 12, positive: true }}
            delay={0.1}
          />
          <StatCard
            label="Open Tickets"
            value={openCount}
            icon={<Clock className="w-16 h-16" />}
            trend={{ value: 8, positive: false }}
            delay={0.2}
          />
          <StatCard
            label="Resolved"
            value={resolvedCount}
            icon={<CheckCircle className="w-16 h-16" />}
            trend={{ value: 24, positive: true }}
            delay={0.3}
          />
          <StatCard
            label="Avg Response Time"
            value={`${DEMO_STATS.avgResponseTime}h`}
            icon={<Zap className="w-16 h-16" />}
            trend={{ value: 15, positive: true }}
            delay={0.4}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content: Tickets */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TicketIcon className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">Recent Tickets</h2>
                </div>
                <div className="flex gap-2">
                  {(['all', 'open', 'in_progress', 'resolved'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm transition-all',
                        statusFilter === status
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                          : 'text-muted-foreground hover:bg-muted/50'
                      )}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <RecentTickets
                tickets={filteredTickets}
                onTicketClick={setSelectedTicket}
              />
            </div>

            {/* Sidebar: Analytics */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-bold text-foreground">Performance</h2>
              </div>

              <AnalyticsCharts stats={DEMO_STATS} />
              <TicketTrendChart data={DEMO_STATS.ticketsTrend} />
            </div>
          </div>
        )}
      </div>

      <TicketDetail
        ticket={selectedTicket}
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

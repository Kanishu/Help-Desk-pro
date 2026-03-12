'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/dashboard/header';
import { GlassCard } from '@/components/ui/glass-card';
import { TicketList, TicketFilters } from '@/components/dashboard/ticket-list';
import { TicketDetail } from '@/components/dashboard/ticket-detail';
import { CreateTicketModal } from '@/components/dashboard/create-ticket-modal';
import { type Ticket, type TicketStatus } from '@/lib/types';
import { useState } from 'react';
import { useTickets } from '@/context/TicketContext';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, Grid3X3, List, Loader2 } from 'lucide-react';

export default function TicketsPage() {
  const { tickets, loading } = useTickets();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filteredTickets = tickets
    .filter(t => statusFilter === 'all' || t.status === statusFilter)
    .filter(t =>
      searchQuery === '' ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticket_number.toString().includes(searchQuery)
    )
    .sort((a, b) => {
      if (sortBy === 'created_at') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'priority') {
        const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === 'ticket_number') return b.ticket_number - a.ticket_number;
      return 0;
    });

  return (
    <div className="min-h-screen">
      <Header
        title="Tickets"
        subtitle={`${filteredTickets.length} tickets found`}
        onCreateTicket={() => setIsCreateModalOpen(true)}
      />

      <div className="p-6 space-y-6">
        {/* Filters Bar */}
        <GlassCard delay={0.1}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets by subject, description, or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/30 border-border/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-muted/30 border-border/50 text-foreground">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="glass border-border/50">
                  <SelectItem value="created_at" className="text-foreground">Newest First</SelectItem>
                  <SelectItem value="priority" className="text-foreground">Priority</SelectItem>
                  <SelectItem value="ticket_number" className="text-foreground">Ticket Number</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <List className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Status Filters */}
          <div className="mt-4 pt-4 border-t border-border/30">
            <TicketFilters activeStatus={statusFilter} onStatusChange={setStatusFilter} />
          </div>
        </GlassCard>

        {/* Tickets List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : filteredTickets.length > 0 ? (
            <TicketList tickets={filteredTickets} onTicketClick={setSelectedTicket} />
          ) : (
            <GlassCard className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center"
              >
                <Search className="w-10 h-10 text-muted-foreground" />
              </motion.div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No tickets found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </GlassCard>
          )}
        </motion.div>
      </div>

      {/* Modals */}
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

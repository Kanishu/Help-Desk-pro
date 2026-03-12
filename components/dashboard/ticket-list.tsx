'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type Ticket, type TicketStatus, type TicketPriority } from '@/lib/types';
import {
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Circle,
  Loader2,
  XCircle,
  MoreHorizontal,
  MessageSquare,
  Paperclip,
  Eye,
  ArrowUp,
  ArrowDown,
  Trash2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useRef, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { useTickets } from '@/context/TicketContext';

interface TicketListProps {
  tickets: Ticket[];
  onTicketClick?: (ticket: Ticket) => void;
}

const statusConfig: Record<TicketStatus, { icon: React.ElementType; color: string; label: string }> = {
  open: { icon: Circle, color: 'text-[oklch(0.7_0.15_200)]', label: 'Open' },
  pending: { icon: Clock, color: 'text-[oklch(0.85_0.12_60)]', label: 'Pending' },
  in_progress: { icon: Loader2, color: 'text-[oklch(0.75_0.2_280)]', label: 'In Progress' },
  resolved: { icon: CheckCircle, color: 'text-[oklch(0.8_0.15_150)]', label: 'Resolved' },
  closed: { icon: XCircle, color: 'text-muted-foreground', label: 'Closed' },
};

const priorityConfig: Record<TicketPriority, { color: string; bgClass: string; label: string }> = {
  low: { color: 'text-[oklch(0.7_0.15_200)]', bgClass: 'priority-low', label: 'Low' },
  medium: { color: 'text-[oklch(0.85_0.12_60)]', bgClass: 'priority-medium', label: 'Medium' },
  high: { color: 'text-[oklch(0.8_0.15_30)]', bgClass: 'priority-high', label: 'High' },
  urgent: { color: 'text-[oklch(0.7_0.2_25)]', bgClass: 'priority-urgent', label: 'Urgent' },
};

function TicketMenu({ ticket, onViewClick }: { ticket: Ticket; onViewClick: () => void }) {
  const [open, setOpen] = useState(false);
  const [statusSub, setStatusSub] = useState(false);
  const [prioritySub, setPrioritySub] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { updateTicketStatus } = useTickets();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setStatusSub(false);
        setPrioritySub(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = async (s: TicketStatus) => {
    await updateTicketStatus(ticket.id, s);
    setOpen(false);
    setStatusSub(false);
  };

  const handlePriorityChange = async (p: TicketPriority) => {
    try {
      await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: p }),
      });
      // Force reload by updating status to same value (triggers re-fetch)
      window.location.reload();
    } catch (err) {
      console.error('Failed to update priority:', err);
    }
    setOpen(false);
    setPrioritySub(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); setStatusSub(false); setPrioritySub(false); }}
      >
        <MoreHorizontal className="w-4 h-4" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -5 }}
            className="absolute right-0 top-full mt-1 w-48 glass rounded-xl border border-border/30 shadow-xl z-50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { onViewClick(); setOpen(false); }}
              className="w-full px-4 py-2.5 text-sm text-left flex items-center gap-2 hover:bg-muted/30 transition-colors text-foreground"
            >
              <Eye className="w-4 h-4 text-muted-foreground" />
              View Details
            </button>

            {/* Status Sub-menu */}
            <div className="relative">
              <button
                onClick={() => { setStatusSub(!statusSub); setPrioritySub(false); }}
                className="w-full px-4 py-2.5 text-sm text-left flex items-center gap-2 hover:bg-muted/30 transition-colors text-foreground"
              >
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
                Change Status
                <span className="ml-auto text-muted-foreground text-xs">▸</span>
              </button>
              <AnimatePresence>
                {statusSub && (
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    className="absolute right-full top-0 mr-1 w-40 glass rounded-xl border border-border/30 shadow-xl overflow-hidden"
                  >
                    {(Object.keys(statusConfig) as TicketStatus[]).map((s) => {
                      const cfg = statusConfig[s];
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          className={cn(
                            'w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-muted/30 transition-colors',
                            ticket.status === s ? 'bg-primary/10 font-medium' : 'text-foreground'
                          )}
                        >
                          <Icon className={cn('w-3.5 h-3.5', cfg.color)} />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Priority Sub-menu */}
            <div className="relative">
              <button
                onClick={() => { setPrioritySub(!prioritySub); setStatusSub(false); }}
                className="w-full px-4 py-2.5 text-sm text-left flex items-center gap-2 hover:bg-muted/30 transition-colors text-foreground"
              >
                <ArrowUp className="w-4 h-4 text-muted-foreground" />
                Change Priority
                <span className="ml-auto text-muted-foreground text-xs">▸</span>
              </button>
              <AnimatePresence>
                {prioritySub && (
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    className="absolute right-full top-0 mr-1 w-36 glass rounded-xl border border-border/30 shadow-xl overflow-hidden"
                  >
                    {(Object.keys(priorityConfig) as TicketPriority[]).map((p) => {
                      const cfg = priorityConfig[p];
                      return (
                        <button
                          key={p}
                          onClick={() => handlePriorityChange(p)}
                          className={cn(
                            'w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-muted/30 transition-colors',
                            ticket.priority === p ? 'bg-primary/10 font-medium' : 'text-foreground'
                          )}
                        >
                          <span className={cn('w-2 h-2 rounded-full', cfg.bgClass)} />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="border-t border-border/30">
              <button
                onClick={() => { setOpen(false); }}
                className="w-full px-4 py-2.5 text-sm text-left flex items-center gap-2 hover:bg-destructive/10 transition-colors text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Delete Ticket
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TicketList({ tickets, onTicketClick }: TicketListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {tickets.map((ticket, index) => {
          const status = statusConfig[ticket.status];
          const priority = priorityConfig[ticket.priority];
          const StatusIcon = status.icon;

          return (
            <motion.div
              key={ticket.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                layout: { duration: 0.3 },
              }}
              onHoverStart={() => setHoveredId(ticket.id)}
              onHoverEnd={() => setHoveredId(null)}
              onClick={() => onTicketClick?.(ticket)}
              className="cursor-pointer"
            >
              <GlassCard
                variant="hover"
                delay={0}
                className={cn(
                  'relative overflow-hidden p-4 transition-all duration-300',
                  ticket.sla_breach && 'border-destructive/50'
                )}
              >
                {/* SLA Breach Warning */}
                {ticket.sla_breach && (
                  <motion.div
                    initial={{ x: -100 }}
                    animate={{ x: 0 }}
                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-destructive to-destructive/50"
                  />
                )}

                {/* Hover Glow Effect */}
                <AnimatePresence>
                  {hoveredId === ticket.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                <div className="relative z-10">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <motion.div
                        animate={ticket.status === 'in_progress' ? { rotate: 360 } : {}}
                        transition={{ duration: 2, repeat: ticket.status === 'in_progress' ? Infinity : 0, ease: 'linear' }}
                      >
                        <StatusIcon className={cn('w-5 h-5 flex-shrink-0', status.color)} />
                      </motion.div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-mono">
                            #{ticket.ticket_number}
                          </span>
                          <span className={cn('text-xs px-2 py-0.5 rounded-full', priority.bgClass)}>
                            {priority.label}
                          </span>
                          {ticket.sla_breach && (
                            <motion.span
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ repeat: Infinity, duration: 1 }}
                              className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive flex items-center gap-1"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              SLA Breach
                            </motion.span>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground truncate mt-1">
                          {ticket.subject}
                        </h3>
                      </div>
                    </div>

                    <TicketMenu
                      ticket={ticket}
                      onViewClick={() => onTicketClick?.(ticket)}
                    />
                  </div>

                  {/* Description Preview */}
                  {ticket.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 pl-8">
                      {ticket.description}
                    </p>
                  )}

                  {/* Tags */}
                  {(ticket.tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3 pl-8">
                      {(ticket.tags || []).slice(0, 3).map((tag, i) => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                          className="text-xs px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground"
                        >
                          {tag}
                        </motion.span>
                      ))}
                      {(ticket.tags || []).length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground">
                          +{(ticket.tags || []).length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pl-8">
                    <div className="flex items-center gap-4">
                      {/* Customer */}
                      {ticket.customer && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-[10px] text-white font-bold">
                            {ticket.customer.full_name?.charAt(0) || 'C'}
                          </div>
                          <span>{ticket.customer.full_name || ticket.customer.email}</span>
                        </div>
                      )}

                      {/* Assignee */}
                      {ticket.assignee && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>{ticket.assignee.full_name}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Comments indicator */}
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>3</span>
                      </div>

                      {/* Attachments indicator */}
                      <div className="flex items-center gap-1">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>2</span>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Ticket filters component
interface TicketFiltersProps {
  activeStatus: TicketStatus | 'all';
  onStatusChange: (status: TicketStatus | 'all') => void;
}

export function TicketFilters({ activeStatus, onStatusChange }: TicketFiltersProps) {
  const statuses: (TicketStatus | 'all')[] = ['all', 'open', 'pending', 'in_progress', 'resolved', 'closed'];

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => {
        const isActive = activeStatus === status;
        const config = status === 'all' ? null : statusConfig[status];
        const Icon = config?.icon;

        return (
          <motion.button
            key={status}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStatusChange(status)}
            className={cn(
              'relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 bg-primary/20 rounded-xl border border-primary/30"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {Icon && <Icon className={cn('w-4 h-4', config?.color)} />}
              {status === 'all' ? 'All' : config?.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

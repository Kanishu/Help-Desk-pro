'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type Ticket, type TicketStatus, type TicketPriority } from '@/lib/types';
import {
  X,
  Clock,
  User,
  Tag,
  Calendar,
  Send,
  Paperclip,
  AlertTriangle,
  CheckCircle,
  Circle,
  Loader2,
  XCircle,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  File,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TicketDetailProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig: Record<TicketStatus, { icon: React.ElementType; color: string; bgClass: string; label: string }> = {
  open: { icon: Circle, color: 'text-[oklch(0.7_0.15_200)]', bgClass: 'status-open', label: 'Open' },
  pending: { icon: Clock, color: 'text-[oklch(0.85_0.12_60)]', bgClass: 'status-pending', label: 'Pending' },
  in_progress: { icon: Loader2, color: 'text-[oklch(0.75_0.2_280)]', bgClass: 'status-in_progress', label: 'In Progress' },
  resolved: { icon: CheckCircle, color: 'text-[oklch(0.8_0.15_150)]', bgClass: 'status-resolved', label: 'Resolved' },
  closed: { icon: XCircle, color: 'text-muted-foreground', bgClass: 'status-closed', label: 'Closed' },
};

const priorityConfig: Record<TicketPriority, { color: string; bgClass: string; label: string }> = {
  low: { color: 'text-[oklch(0.7_0.15_200)]', bgClass: 'priority-low', label: 'Low' },
  medium: { color: 'text-[oklch(0.85_0.12_60)]', bgClass: 'priority-medium', label: 'Medium' },
  high: { color: 'text-[oklch(0.8_0.15_30)]', bgClass: 'priority-high', label: 'High' },
  urgent: { color: 'text-[oklch(0.7_0.2_25)]', bgClass: 'priority-urgent', label: 'Urgent' },
};

interface Comment {
  id: string;
  content: string;
  is_internal: boolean;
  is_system?: boolean;
  attachments?: { name: string; type: string; size: number }[];
  created_at: string;
}

import { useTickets } from '@/context/TicketContext';
import { createClient } from '@/lib/supabase/client';

export function TicketDetail({ ticket, isOpen, onClose }: TicketDetailProps) {
  const { updateTicketStatus } = useTickets();
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; type: string; size: number }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load comments when ticket opens
  useEffect(() => {
    let channel: any;

    if (ticket && isOpen) {
      const fetchComments = () => {
        setLoadingComments(true);
        fetch(`/api/tickets/${ticket.id}/comments`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setComments(data);
            setLoadingComments(false);
          })
          .catch(() => setLoadingComments(false));
      };
      
      fetchComments();

      const supabase = createClient();
      channel = supabase.channel(`ticket_comments-${ticket.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'ticket_comments', filter: `ticket_id=eq.${ticket.id}` },
          () => fetchComments()
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        createClient().removeChannel(channel);
      }
    };
  }, [ticket?.id, isOpen]);

  if (!ticket) return null;

  const handleStatusChange = async (status: string) => {
    try {
      await updateTicketStatus(ticket.id, status as TicketStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSendReply = async () => {
    if (!newComment.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          is_internal: isInternal,
          attachments: attachedFiles,
        }),
      });
      const data = await res.json();
      if (!data.error) {
        setComments(prev => [...prev, data]);
        setNewComment('');
        setAttachedFiles([]);
        setIsInternal(false);
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
    }
    setSendingReply(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
      }));
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    return File;
  };

  const status = statusConfig[ticket.status];
  const priority = priorityConfig[ticket.priority];
  const StatusIcon = status.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-screen w-full max-w-2xl glass z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="p-6 border-b border-border/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={ticket.status === 'in_progress' ? { rotate: 360 } : {}}
                    transition={{ duration: 2, repeat: ticket.status === 'in_progress' ? Infinity : 0, ease: 'linear' }}
                  >
                    <StatusIcon className={cn('w-6 h-6', status.color)} />
                  </motion.div>
                  <div>
                    <span className="text-sm text-muted-foreground font-mono">
                      Ticket #{ticket.ticket_number}
                    </span>
                    {ticket.sla_breach && (
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="ml-2 text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive"
                      >
                        SLA Breach
                      </motion.span>
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <h2 className="text-xl font-bold text-foreground mb-4">{ticket.subject}</h2>

              <div className="flex flex-wrap gap-2 items-center">
                {/* Clickable status dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className={cn('px-3 py-1 rounded-full text-sm flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity', status.bgClass)}
                  >
                    {status.label}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {statusDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 mt-2 w-44 glass rounded-xl border border-border/30 shadow-xl z-50 overflow-hidden"
                    >
                      {(Object.keys(statusConfig) as TicketStatus[]).map((s) => {
                        const cfg = statusConfig[s];
                        const Icon = cfg.icon;
                        return (
                          <button
                            key={s}
                            onClick={() => { handleStatusChange(s); setStatusDropdownOpen(false); }}
                            className={cn(
                              'w-full px-4 py-2.5 text-sm text-left flex items-center gap-2 hover:bg-muted/30 transition-colors',
                              ticket.status === s ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                            )}
                          >
                            <Icon className={cn('w-4 h-4', cfg.color)} />
                            {cfg.label}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
                <span className={cn('px-3 py-1 rounded-full text-sm', priority.bgClass)}>
                  {priority.label} Priority
                </span>
                {ticket.category && (
                  <span className="px-3 py-1 rounded-full text-sm bg-muted/50 text-muted-foreground">
                    {ticket.category}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Details */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-xl p-4 mb-6"
              >
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {ticket.customer && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Customer:</span>
                      <span className="text-foreground font-medium">{ticket.customer.full_name}</span>
                    </div>
                  )}
                  {ticket.assignee && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Assigned:</span>
                      <span className="text-foreground font-medium">{ticket.assignee.full_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created:</span>
                    <span className="text-foreground">{format(new Date(ticket.created_at), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  {ticket.due_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Due:</span>
                      <span className={cn('text-foreground', ticket.sla_breach && 'text-destructive font-medium')}>
                        {formatDistanceToNow(new Date(ticket.due_date), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                </div>

                {(ticket.tags || []).length > 0 && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1.5">
                      {(ticket.tags || []).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-primary/20 text-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Description */}
              {ticket.description && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6"
                >
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    Description
                  </h3>
                  <div className="glass-card rounded-xl p-4">
                    <p className="text-foreground whitespace-pre-wrap">{ticket.description}</p>
                  </div>
                </motion.div>
              )}

              {/* Comments Thread */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
                  Conversation
                </h3>
                {loadingComments ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground glass-card rounded-xl">
                    No replies yet. Start the conversation below.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          'glass-card rounded-xl p-4',
                          comment.is_internal && 'border-l-4 border-[oklch(0.75_0.15_60)] bg-[oklch(0.75_0.15_60_/_0.1)]'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-primary to-accent">
                            A
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground text-sm">Admin</span>
                              {comment.is_internal && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-[oklch(0.75_0.15_60_/_0.2)] text-[oklch(0.85_0.12_60)]">
                                  Internal Note
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground ml-auto">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-foreground/90 text-sm whitespace-pre-wrap">{comment.content}</p>
                            {/* Show attachments */}
                            {comment.attachments && comment.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {comment.attachments.map((att: any, i: number) => {
                                  const FileIcon = getFileIcon(att.type || '');
                                  return (
                                    <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30 text-xs text-muted-foreground">
                                      <FileIcon className="w-3 h-3" />
                                      <span className="truncate max-w-[120px]">{att.name}</span>
                                      <span className="text-muted-foreground/60">({formatFileSize(att.size)})</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Reply Box */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="p-6 border-t border-border/30"
            >
              <div className="glass-card rounded-xl p-4">
                <Textarea
                  placeholder="Type your reply..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] bg-transparent border-none resize-none focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSendReply();
                    }
                  }}
                />

                {/* Attached Files Preview */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-border/20">
                    {attachedFiles.map((file, i) => {
                      const FileIcon = getFileIcon(file.type);
                      return (
                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/30 text-xs group">
                          <FileIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-foreground truncate max-w-[150px]">{file.name}</span>
                          <span className="text-muted-foreground/60">({formatFileSize(file.size)})</span>
                          <button
                            onClick={() => removeFile(i)}
                            className="ml-1 p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    {/* File Attachment */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"
                      title="Attach files"
                    >
                      <Paperclip className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsInternal(!isInternal)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors',
                        isInternal
                          ? 'bg-[oklch(0.75_0.15_60_/_0.2)] text-[oklch(0.85_0.12_60)]'
                          : 'hover:bg-muted/50 text-muted-foreground'
                      )}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Internal Note
                    </motion.button>
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleSendReply}
                      disabled={sendingReply || !newComment.trim()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {sendingReply ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {sendingReply ? 'Sending...' : 'Send Reply'}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

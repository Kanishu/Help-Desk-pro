'use client';

import { motion } from 'framer-motion';
import { Mail, RefreshCcw, Search, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { EmailQueueItem } from '@/lib/types';

export default function EmailsPage() {
    const [emails, setEmails] = useState<EmailQueueItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEmails = () => {
        setLoading(true);
        fetch('/api/emails')
            .then(res => res.json())
            .then(data => { setEmails(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchEmails(); }, []);

    const sentCount = emails.filter(e => e.status === 'sent').length;
    const pendingCount = emails.filter(e => e.status === 'pending').length;
    const failedCount = emails.filter(e => e.status === 'failed').length;

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Mail className="w-8 h-8 text-primary" />
                        Email Queue
                    </h1>
                    <p className="text-muted-foreground mt-1">Monitor outgoing system and support emails</p>
                </div>
                <Button variant="outline" onClick={fetchEmails} className="border-border/50 flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4" /> Sync Queue
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total', count: emails.length, icon: Mail, color: 'text-primary' },
                    { label: 'Sent', count: sentCount, icon: CheckCircle2, color: 'text-green-500' },
                    { label: 'Pending', count: pendingCount, icon: Clock, color: 'text-yellow-500' },
                    { label: 'Failed', count: failedCount, icon: AlertCircle, color: 'text-red-500' },
                ].map((stat, i) => (
                    <div key={i} className="glass p-4 rounded-xl border border-border/30 flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-foreground">{stat.count}</div>
                            <div className="text-xs text-muted-foreground uppercase">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="glass rounded-2xl overflow-hidden border border-border/30">
                    <div className="p-4 border-b border-border/30 flex justify-between items-center bg-muted/10">
                        <h3 className="font-semibold text-foreground">Recent Activity</h3>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                            <Input placeholder="Filter queue..." className="pl-8 h-8 text-xs bg-muted/30 border-border/50" />
                        </div>
                    </div>
                    <div className="divide-y divide-border/30">
                        {emails.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No emails in queue</div>
                        ) : emails.map((email, index) => (
                            <motion.div
                                key={email.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={[
                                        "w-2 h-2 rounded-full shadow-glow",
                                        email.status === 'sent' ? 'bg-green-500 shadow-green-500/50' :
                                            email.status === 'failed' ? 'bg-red-500 shadow-red-500/50' : 'bg-yellow-500 shadow-yellow-500/50'
                                    ].join(' ')} />
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-medium text-foreground">{email.to_email}</div>
                                        <div className="text-xs text-muted-foreground">{email.subject}</div>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">
                                    {email.status}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

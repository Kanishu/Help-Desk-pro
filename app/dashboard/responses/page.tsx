'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Search, Command, Loader2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CannedResponse } from '@/lib/types';

export default function ResponsesPage() {
    const [responses, setResponses] = useState<CannedResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', shortcut: '', category: '' });

    useEffect(() => {
        fetch('/api/responses')
            .then(res => res.json())
            .then(data => { setResponses(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleAddResponse = async () => {
        if (!form.title.trim() || !form.content.trim()) return;
        setSaving(true);
        try {
            const res = await fetch('/api/responses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!data.error) {
                setResponses(prev => [data, ...prev]);
                setForm({ title: '', content: '', shortcut: '', category: '' });
                setShowModal(false);
            }
        } catch (err) {
            console.error('Failed to add response:', err);
        }
        setSaving(false);
    };

    const filtered = responses.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.content.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-primary" />
                        Canned Responses
                    </h1>
                    <p className="text-muted-foreground mt-1">Ready-to-use message templates for faster support</p>
                </div>
                <Button
                    onClick={() => setShowModal(true)}
                    className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> New Response
                </Button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search templates..."
                    className="pl-10 bg-muted/30 border-border/50"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.length === 0 ? (
                        <div className="col-span-2 text-center py-20 text-muted-foreground">No canned responses found</div>
                    ) : filtered.map((r, index) => (
                        <motion.div
                            key={r.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-6 rounded-2xl glass border border-border/30 hover:border-primary/30 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{r.title}</h3>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">{r.category || 'General'}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 italic">&ldquo;{r.content}&rdquo;</p>
                            {r.shortcut && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border/30 pt-3">
                                    <Command className="w-3 h-3" />
                                    <span>{r.shortcut}</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add Response Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 flex items-center justify-center z-50 p-4"
                        >
                            <div className="w-full max-w-md glass rounded-2xl border border-border/30 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-foreground">New Canned Response</h2>
                                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted/50 rounded-lg text-muted-foreground">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Title *</Label>
                                        <Input
                                            placeholder="e.g. Welcome Reply"
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            className="bg-muted/30 border-border/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Content *</Label>
                                        <Textarea
                                            placeholder="Type the response template..."
                                            value={form.content}
                                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                                            className="bg-muted/30 border-border/50 min-h-[100px]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Shortcut</Label>
                                            <Input
                                                placeholder="/welcome"
                                                value={form.shortcut}
                                                onChange={(e) => setForm({ ...form, shortcut: e.target.value })}
                                                className="bg-muted/30 border-border/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Input
                                                placeholder="General"
                                                value={form.category}
                                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                                className="bg-muted/30 border-border/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button variant="outline" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleAddResponse}
                                        disabled={saving || !form.title.trim() || !form.content.trim()}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        {saving ? 'Creating...' : 'Create Response'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

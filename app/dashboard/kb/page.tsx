'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Plus, ExternalLink, ThumbsUp, Eye, Loader2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { KBArticle } from '@/lib/types';

export default function KBPage() {
    const [articles, setArticles] = useState<KBArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', category: '', slug: '' });

    useEffect(() => {
        fetch('/api/kb')
            .then(res => res.json())
            .then(data => { setArticles(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleCreateArticle = async () => {
        if (!form.title.trim() || !form.content.trim()) return;
        setSaving(true);
        try {
            const res = await fetch('/api/kb', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                }),
            });
            const data = await res.json();
            if (!data.error) {
                setArticles(prev => [data, ...prev]);
                setForm({ title: '', content: '', category: '', slug: '' });
                setShowModal(false);
            }
        } catch (err) {
            console.error('Failed to create article:', err);
        }
        setSaving(false);
    };

    const filtered = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-primary" />
                        Knowledge Base
                    </h1>
                    <p className="text-muted-foreground mt-1">Documentation and self-service help articles</p>
                </div>
                <Button
                    onClick={() => setShowModal(true)}
                    className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Create Article
                </Button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search articles..."
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.length === 0 ? (
                        <div className="col-span-3 text-center py-20 text-muted-foreground">No articles found</div>
                    ) : filtered.map((article, index) => (
                        <motion.div
                            key={article.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 rounded-2xl glass border border-border/30 hover:shadow-xl hover:shadow-primary/5 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                    {article.category || 'General'}
                                </span>
                                <button className="text-muted-foreground hover:text-foreground">
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                                {article.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <Eye className="w-4 h-4" />
                                    {article.view_count || 0}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <ThumbsUp className="w-4 h-4" />
                                    {article.helpful_count || 0}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Article Modal */}
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
                            <div className="w-full max-w-lg glass rounded-2xl border border-border/30 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-foreground">Create Article</h2>
                                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted/50 rounded-lg text-muted-foreground">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Title *</Label>
                                        <Input
                                            placeholder="e.g. How to Reset Your Password"
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            className="bg-muted/30 border-border/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Content *</Label>
                                        <Textarea
                                            placeholder="Write the article content..."
                                            value={form.content}
                                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                                            className="bg-muted/30 border-border/50 min-h-[150px]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Input
                                                placeholder="Getting Started"
                                                value={form.category}
                                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                                className="bg-muted/30 border-border/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>URL Slug</Label>
                                            <Input
                                                placeholder="auto-generated"
                                                value={form.slug}
                                                onChange={(e) => setForm({ ...form, slug: e.target.value })}
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
                                        onClick={handleCreateArticle}
                                        disabled={saving || !form.title.trim() || !form.content.trim()}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        {saving ? 'Creating...' : 'Publish Article'}
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

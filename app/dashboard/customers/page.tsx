'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Mail, Phone, Building2, MoreVertical, UserPlus, Loader2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Customer } from '@/lib/types';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ full_name: '', email: '', phone: '', company: '' });

    const loadCustomers = () => {
        fetch('/api/customers')
            .then(res => res.json())
            .then(data => { setCustomers(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { loadCustomers(); }, []);

    const handleAddCustomer = async () => {
        if (!form.email.trim()) return;
        setSaving(true);
        try {
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!data.error) {
                setCustomers(prev => [data, ...prev]);
                setForm({ full_name: '', email: '', phone: '', company: '' });
                setShowModal(false);
            }
        } catch (err) {
            console.error('Failed to add customer:', err);
        }
        setSaving(false);
    };

    const filtered = customers.filter(c =>
        (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" />
                        Customers
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage your customer database and interaction history</p>
                </div>
                <Button
                    onClick={() => setShowModal(true)}
                    className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" /> Add Customer
                </Button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search customers..."
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
                <div className="glass rounded-2xl overflow-hidden border border-border/30">
                    <table className="w-full text-left">
                        <thead className="bg-muted/30 text-sm font-medium text-muted-foreground border-b border-border/30">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Company</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No customers found</td></tr>
                            ) : filtered.map((customer, index) => (
                                <motion.tr
                                    key={customer.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-muted/20 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                                {(customer.full_name || customer.email).charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-foreground">{customer.full_name || customer.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Building2 className="w-4 h-4" />
                                            {customer.company || '—'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-foreground">
                                                <Mail className="w-3 h-3 text-muted-foreground" />
                                                {customer.email}
                                            </div>
                                            {customer.phone && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Phone className="w-3 h-3" />
                                                    {customer.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-muted/50 rounded-lg text-muted-foreground">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Customer Modal */}
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
                                    <h2 className="text-xl font-bold text-foreground">Add Customer</h2>
                                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted/50 rounded-lg text-muted-foreground">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input
                                            placeholder="John Doe"
                                            value={form.full_name}
                                            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                            className="bg-muted/30 border-border/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email *</Label>
                                        <Input
                                            type="email"
                                            placeholder="john@company.com"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="bg-muted/30 border-border/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input
                                            placeholder="+1 (555) 123-4567"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className="bg-muted/30 border-border/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Company</Label>
                                        <Input
                                            placeholder="Acme Inc."
                                            value={form.company}
                                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                                            className="bg-muted/30 border-border/50"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button variant="outline" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleAddCustomer}
                                        disabled={saving || !form.email.trim()}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        {saving ? 'Adding...' : 'Add Customer'}
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

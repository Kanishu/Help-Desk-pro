'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { type Ticket, type TicketStatus, type TicketPriority } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface TicketContextType {
    tickets: Ticket[];
    loading: boolean;
    error: string | null;
    addTicket: (ticket: {
        subject: string;
        description: string;
        priority: TicketPriority;
        category: string;
        customer_email: string;
    }) => Promise<void>;
    updateTicketStatus: (id: string, status: TicketStatus) => Promise<void>;
    refreshTickets: () => Promise<void>;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: React.ReactNode }) {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch('/api/tickets');
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to fetch tickets');
            }
            const data = await res.json();
            setTickets(data);
        } catch (err: any) {
            console.error('Failed to fetch tickets:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();

        const channel = supabase.channel('public:tickets')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tickets' },
                () => {
                    fetchTickets();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchTickets, supabase]);

    const addTicket = async (data: {
        subject: string;
        description: string;
        priority: TicketPriority;
        category: string;
        customer_email: string;
    }) => {
        const res = await fetch('/api/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to create ticket');
        }

        const newTicket = await res.json();
        setTickets(prev => [newTicket, ...prev]);
    };

    const updateTicketStatus = async (id: string, status: TicketStatus) => {
        const res = await fetch(`/api/tickets/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to update ticket');
        }

        const updatedTicket = await res.json();
        setTickets(prev =>
            prev.map(t => (t.id === id ? updatedTicket : t))
        );
    };

    return (
        <TicketContext.Provider value={{ tickets, loading, error, addTicket, updateTicketStatus, refreshTickets: fetchTickets }}>
            {children}
        </TicketContext.Provider>
    );
}

export function useTickets() {
    const context = useContext(TicketContext);
    if (context === undefined) {
        throw new Error('useTickets must be used within a TicketProvider');
    }
    return context;
}

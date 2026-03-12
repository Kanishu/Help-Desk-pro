'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'hover' | 'glow';
  delay?: number;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', delay = 0, children, ...props }, ref) => {
    const variants = {
      default: 'glass-card',
      hover: 'glass-card glass-hover',
      glow: 'glass-card animate-pulse-glow',
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay,
          ease: [0.4, 0, 0.2, 1],
        }}
        className={cn(
          'rounded-2xl p-6',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// Animated stat card with counter effect
interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  delay?: number;
  className?: string;
}

export function StatCard({ label, value, icon, trend, delay = 0, className }: StatCardProps) {
  return (
    <GlassCard variant="hover" delay={delay} className={cn('relative overflow-hidden', className)}>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: delay + 0.2, duration: 0.5 }}
          className="w-full h-full flex items-center justify-center text-primary"
        >
          {icon}
        </motion.div>
      </div>
      
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.1 }}
          className="text-muted-foreground text-sm font-medium mb-2"
        >
          {label}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
          className="text-4xl font-bold text-foreground mb-2"
        >
          {typeof value === 'number' ? (
            <CountUp end={value} duration={1.5} delay={delay + 0.3} />
          ) : (
            value
          )}
        </motion.div>
        
        {trend && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.4 }}
            className={cn(
              'text-sm font-medium flex items-center gap-1',
              trend.positive ? 'text-[oklch(0.7_0.2_150)]' : 'text-destructive'
            )}
          >
            <motion.span
              animate={{ y: trend.positive ? [-2, 0] : [0, 2] }}
              transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
            >
              {trend.positive ? '↑' : '↓'}
            </motion.span>
            {trend.value}% from last week
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
}

// Animated counter component
function CountUp({ end, duration = 1, delay = 0 }: { end: number; duration?: number; delay?: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <motion.span
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
      >
        {end.toLocaleString()}
      </motion.span>
    </motion.span>
  );
}

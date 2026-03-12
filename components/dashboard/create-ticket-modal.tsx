'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: TicketFormData) => void;
}

interface TicketFormData {
  subject: string;
  description: string;
  priority: string;
  category: string;
  customerEmail: string;
}

const categories = [
  'Technical Support',
  'Billing',
  'General Inquiry',
  'Feature Request',
  'Bug Report',
  'Account',
];

const priorities = [
  { value: 'low', label: 'Low', color: 'text-[oklch(0.7_0.15_200)]' },
  { value: 'medium', label: 'Medium', color: 'text-[oklch(0.85_0.12_60)]' },
  { value: 'high', label: 'High', color: 'text-[oklch(0.8_0.15_30)]' },
  { value: 'urgent', label: 'Urgent', color: 'text-[oklch(0.7_0.2_25)]' },
];

import { useTickets } from '@/context/TicketContext';
import { type TicketPriority } from '@/lib/types';

export function CreateTicketModal({ isOpen, onClose }: CreateTicketModalProps) {
  const { addTicket } = useTickets();
  const [formData, setFormData] = useState<TicketFormData>({
    subject: '',
    description: '',
    priority: 'medium',
    category: '',
    customerEmail: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await addTicket({
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority as TicketPriority,
        category: formData.category,
        customer_email: formData.customerEmail,
      });
      onClose();
      setFormData({ subject: '', description: '', priority: 'medium', category: '', customerEmail: '' });
      setCurrentStep(1);
    } catch (err) {
      console.error('Failed to create ticket:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.subject.length > 0 && formData.category.length > 0;
      case 2:
        return formData.description.length > 0;
      case 3:
        return formData.customerEmail.length > 0;
      default:
        return false;
    }
  };

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

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg glass rounded-2xl z-50 overflow-hidden"
          >
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-[100%] bg-gradient-conic from-primary via-accent to-primary opacity-20"
              />
            </div>

            {/* Content */}
            <div className="relative bg-card/80 backdrop-blur-xl">
              {/* Header */}
              <div className="p-6 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Create New Ticket</h2>
                      <p className="text-sm text-muted-foreground">Step {currentStep} of 3</p>
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

                {/* Progress bar */}
                <div className="mt-4 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${(currentStep / 3) * 100}%` }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  />
                </div>
              </div>

              {/* Form Steps */}
              <div className="p-6 min-h-[300px]">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-foreground">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="Brief description of the issue"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="bg-muted/30 border-border/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-foreground">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger className="bg-muted/30 border-border/50 text-foreground">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent className="glass border-border/50">
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat} className="text-foreground hover:bg-muted/50">
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-foreground">Priority</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {priorities.map((p) => (
                            <motion.button
                              key={p.value}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setFormData({ ...formData, priority: p.value })}
                              className={cn(
                                'p-3 rounded-xl border transition-all text-sm font-medium',
                                formData.priority === p.value
                                  ? `border-current ${p.color} bg-current/10`
                                  : 'border-border/50 text-muted-foreground hover:border-border'
                              )}
                            >
                              {p.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-foreground">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Please describe the issue in detail..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="min-h-[200px] bg-muted/30 border-border/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                        />
                      </div>

                      <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-primary/90">
                          Provide as much detail as possible to help us resolve your issue faster.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">Customer Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="customer@example.com"
                          value={formData.customerEmail}
                          onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                          className="bg-muted/30 border-border/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                        />
                      </div>

                      {/* Summary */}
                      <div className="p-4 rounded-xl glass-card space-y-3">
                        <h4 className="font-semibold text-foreground">Ticket Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subject:</span>
                            <span className="text-foreground font-medium">{formData.subject}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category:</span>
                            <span className="text-foreground">{formData.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Priority:</span>
                            <span className={priorities.find(p => p.value === formData.priority)?.color}>
                              {priorities.find(p => p.value === formData.priority)?.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border/30 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
                  className="border-border/50 text-muted-foreground hover:bg-muted/50"
                >
                  {currentStep > 1 ? 'Back' : 'Cancel'}
                </Button>

                {currentStep < 3 ? (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={!isStepValid(currentStep)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Continue
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleSubmit}
                      disabled={!isStepValid(currentStep) || isSubmitting}
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                        />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {isSubmitting ? 'Creating...' : 'Create Ticket'}
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

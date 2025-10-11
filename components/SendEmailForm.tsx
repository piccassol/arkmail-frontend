'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { sendEmail } from '../api/fetchData';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';

interface SendEmailFormProps {
  onSend?: () => void; // Callback to refresh email list
}

export default function SendEmailForm({ onSend }: SendEmailFormProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!session?.accessToken) {
      toast({
        title: 'Error',
        description: 'You must be logged in to send an email.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      await sendEmail({
        to,
        subject,
        html,
        token: session.accessToken,
      });
      toast({
        title: 'Success',
        description: 'Email sent successfully!',
      });
      setTo('');
      setSubject('');
      setHtml('');
      if (onSend) onSend(); // Refresh email list
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Compose Email</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Recipient Email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <Textarea
          placeholder="Email content (HTML)"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading || !session}>
          {loading ? 'Sending...' : 'Send Email'}
        </Button>
      </form>
    </div>
  );
}
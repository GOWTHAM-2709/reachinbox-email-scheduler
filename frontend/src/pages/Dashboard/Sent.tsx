import { useState, useEffect } from "react";
import { apiClient } from '../../api/client';
import { Badge, Loading, EmptyState } from '../../components/UI';
import { format } from 'date-fns';
import { Send, CheckCircle2, Mail, AlertCircle } from 'lucide-react';

export const SentEmails = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await apiClient.get('/api/emails/sent');
        setEmails(res.data);
      } catch (err) {
        setError('Unable to load sent email history. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchEmails();
  }, []);

  if (loading) return <Loading text="Loading sent history..." />;

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <EmptyState
        icon={Send}
        title="No sent emails yet"
        description="Delivered emails will appear here once processed and dispatched by the BullMQ background worker."
      />
    );
  }

  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Recipient
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Subject Line
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Delivered Timestamp
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                Delivery Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-transparent">
            {emails.map((email: any) => (
              <tr key={email.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center flex-shrink-0 group-hover:border-emerald-500/40 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {email.recipient}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-xs truncate text-sm text-slate-600 dark:text-slate-300">
                  {email.subject}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {email.sentAt ? format(new Date(email.sentAt), 'MMM d, yyyy · HH:mm:ss') : 'Delivered'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Badge status={email.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
        {emails.map((email: any) => (
          <div key={email.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{email.recipient}</span>
              </div>
              <Badge status={email.status} />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{email.subject}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>
                {email.sentAt ? format(new Date(email.sentAt), 'MMM d, yyyy · HH:mm:ss') : 'Delivered'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

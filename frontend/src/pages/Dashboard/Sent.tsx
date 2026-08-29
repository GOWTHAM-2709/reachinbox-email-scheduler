import { useState, useEffect } from "react";
import { apiClient } from '../../api/client';
import { Badge, Loading, EmptyState } from '../../components/UI';
import { format } from 'date-fns';
import { Send, CheckCircle, Mail, AlertCircle } from 'lucide-react';

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
        setError('Unable to load sent emails. Please try again.');
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
        <div className="mx-auto w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-rose-600">{error}</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <EmptyState
        icon={Send}
        title="No sent emails yet"
        description="Emails will appear here once processed and dispatched by the background worker."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-left">
        <thead className="bg-slate-50/75 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Recipient
            </th>
            <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Subject
            </th>
            <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Delivered At
            </th>
            <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {emails.map((email: any) => (
            <tr key={email.id} className="hover:bg-slate-50/80 transition-colors group">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                    {email.recipient}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 max-w-xs truncate text-sm text-slate-600 font-normal">
                {email.subject}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
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
  );
};

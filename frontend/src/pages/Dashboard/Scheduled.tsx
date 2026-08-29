import { useState, useEffect } from "react";
import { apiClient } from '../../api/client';
import { Badge, Loading, EmptyState } from '../../components/UI';
import { format } from 'date-fns';
import { Clock, Calendar, Mail, AlertCircle } from 'lucide-react';

export const ScheduledEmails = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await apiClient.get('/api/emails/scheduled');
        setEmails(res.data);
      } catch (err) {
        setError('Unable to load scheduled emails. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchEmails();
  }, []);

  if (loading) return <Loading text="Loading scheduled emails..." />;

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
        icon={Clock}
        title="No scheduled emails"
        description="You have no emails waiting in the delivery queue. Compose a new campaign to schedule emails."
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
              Scheduled For
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
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{format(new Date(email.scheduledAt), 'MMM d, yyyy · HH:mm:ss')}</span>
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

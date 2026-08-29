import { useState } from "react";
import { apiClient } from '../../api/client';
import { Badge, Loading, Button, EmptyState } from '../../components/UI';
import { format } from 'date-fns';
import { Search as SearchIcon, Mail, Calendar, Sparkles, X } from 'lucide-react';

export const Search = () => {
  const [query, setQuery] = useState('');
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setError('');

    try {
      const res = await apiClient.get(`/api/emails/search?q=${encodeURIComponent(query)}`);
      setEmails(res.data);
    } catch (err) {
      setError('Search query failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setEmails([]);
    setHasSearched(false);
  };

  return (
    <div className="p-6">
      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="mb-6 max-w-2xl">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <SearchIcon className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full pl-10 pr-9 py-2 text-sm border border-slate-300 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Search recipient, subject, or body keyword..."
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" isLoading={loading} size="md">
            Search
          </Button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-4 rounded-lg bg-rose-50 text-rose-700 text-sm border border-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <Loading text="Searching emails..." />
      ) : !hasSearched ? (
        <EmptyState
          icon={Sparkles}
          title="Fast Full-Text Search"
          description="Type a recipient email, subject line, or keyword to search across all your campaigns."
        />
      ) : emails.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="No matching emails found"
          description={`No results found matching "${query}". Try searching with a different keyword.`}
        />
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
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
                  Date
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
                      <span>
                        {email.sentAt
                          ? format(new Date(email.sentAt), 'MMM d, yyyy · HH:mm')
                          : email.scheduledAt
                          ? format(new Date(email.scheduledAt), 'MMM d, yyyy · HH:mm')
                          : 'N/A'}
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
      )}
    </div>
  );
};

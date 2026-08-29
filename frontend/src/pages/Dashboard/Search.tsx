import { useState, useEffect } from "react";
import { apiClient } from '../../api/client';
import { Badge, Loading, Button } from '../../components/UI';
import { format } from 'date-fns';
import { Search as SearchIcon } from 'lucide-react';

export const Search = () => {
  const [query, setQuery] = useState('');
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await apiClient.get(`/api/emails/search?q=${encodeURIComponent(query)}`);
      setEmails(res.data);
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSearch} className="mb-6 flex space-x-4 max-w-2xl">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search emails by recipient or subject..."
          />
        </div>
        <Button type="submit" isLoading={loading}>Search</Button>
      </form>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled/Sent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {emails.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  {query ? 'No results found.' : 'Enter a search term to find emails.'}
                </td>
              </tr>
            ) : (
              emails.map((email: any) => (
                <tr key={email.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email.recipient}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{email.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {email.sentAt 
                      ? format(new Date(email.sentAt), 'MMM d, yyyy HH:mm:ss')
                      : format(new Date(email.scheduledAt), 'MMM d, yyyy HH:mm:ss')
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge status={email.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

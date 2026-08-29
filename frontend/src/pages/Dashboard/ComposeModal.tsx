import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '../../components/UI';
import { apiClient } from '../../api/client';
import { X, UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export const ComposeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [startTime, setStartTime] = useState('');
  const [delayBetweenEmails, setDelayBetweenEmails] = useState(2);
  const [hourlyLimit, setHourlyLimit] = useState(100);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');

    Papa.parse(file, {
      complete: (results) => {
        const emails = results.data
          .flat()
          .filter((v: any) => typeof v === 'string' && v.includes('@'))
          .map((v: any) => (v as string).trim());
        
        const uniqueEmails = Array.from(new Set(emails));
        if (uniqueEmails.length === 0) {
          setError('No valid email addresses found in the selected CSV file.');
          setRecipients([]);
        } else {
          setRecipients(uniqueEmails);
        }
      },
      error: () => setError('Failed to parse CSV file.'),
    });
  };

  const handleRemoveFile = () => {
    setFileName('');
    setRecipients([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recipients.length === 0) {
      setError('Please upload a recipient CSV file with at least one valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiClient.post('/api/emails/schedule', {
        subject,
        body,
        recipients,
        startTime: startTime ? new Date(startTime).toISOString() : undefined,
        delayBetweenEmails,
        hourlyLimit
      });
      onClose();
      // Reload current tab data
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to schedule emails');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />

        {/* Modal Dialog Card */}
        <div className="relative inline-block bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-xl w-full border border-slate-200 z-10">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Compose Email Campaign
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure scheduling, rate limiting, and recipient lists.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="e.g. Special Product Update & Demo Invitation"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Content
                </label>
                <textarea
                  required
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
                  placeholder="Hi there, we'd like to share an exciting update..."
                />
              </div>

              {/* CSV Upload Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Recipient List (CSV)
                </label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />

                {!fileName ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20 rounded-xl p-5 text-center cursor-pointer transition-all group"
                  >
                    <UploadCloud className="w-7 h-7 mx-auto text-slate-400 group-hover:text-blue-600 mb-2 transition-colors" />
                    <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                      Click to upload recipient CSV
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      File must contain an email column (.csv or .txt)
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 border border-slate-200 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-800 truncate">{fileName}</p>
                        <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 inline" /> {recipients.length} recipients detected
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 hover:bg-rose-50 rounded transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Timing & Rate Limit Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Leave empty for now</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Min Delay (sec)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={delayBetweenEmails}
                    onChange={(e) => setDelayBetweenEmails(parseInt(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Between each send</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hourly Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={hourlyLimit}
                    onChange={(e) => setHourlyLimit(parseInt(e.target.value) || 1)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Max per hour</span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                Schedule Campaign
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

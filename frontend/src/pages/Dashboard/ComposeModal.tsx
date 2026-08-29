import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '../../components/UI';
import { apiClient } from '../../api/client';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

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
      setError('Please upload a recipient CSV file containing valid email addresses.');
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
      // Reload current queue
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to schedule campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop blur */}
        <div 
          className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md transition-opacity" 
          onClick={onClose}
        />

        {/* Modal Dialog Card */}
        <div className="relative inline-block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-xl w-full z-10 animate-in">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/70 dark:bg-slate-950/40">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Compose Email Campaign
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure scheduling, rate limiting, and recipient lists.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  placeholder="e.g. Special Product Update & Demo Invitation"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Content
                </label>
                <textarea
                  required
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-y"
                  placeholder="Hi there, we'd like to share an exciting update..."
                />
              </div>

              {/* CSV Upload Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
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
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-blue-50/20 dark:hover:bg-blue-500/5 rounded-2xl p-6 text-center cursor-pointer transition-all group"
                  >
                    <UploadCloud className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2 transition-colors" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Click or drag & drop recipient CSV file
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Supports comma-separated or column-based email lists
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 rounded-2xl">
                    <div className="flex items-center gap-3 truncate">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{fileName}</p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 inline" /> {recipients.length} recipients detected
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium px-2.5 py-1 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Timing & Rate Limit Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">Leave empty for instant</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Min Delay (sec)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={delayBetweenEmails}
                    onChange={(e) => setDelayBetweenEmails(parseInt(e.target.value) || 0)}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">Inter-send delay</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hourly Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={hourlyLimit}
                    onChange={(e) => setHourlyLimit(parseInt(e.target.value) || 1)}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">Max sends / hour</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 rounded-b-3xl">
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

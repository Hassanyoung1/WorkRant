'use client';

import { useState } from 'react';
import apiService from '@/lib/api';

interface ReportModalProps {
  postId: string;
  onClose: () => void;
}

export default function ReportModal({ postId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const reasons = [
    'harassment',
    'inappropriate_content',
    'personal_information',
    'spam',
    'hate_speech',
    'misinformation',
    'other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await apiService.reportPost(postId, {
        reason,
        details
      });
      onClose();
    } catch {
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-700">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Report Post</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-1">
                Reason for Report
              </label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500"
                required
              >
                <option value="">Select a reason</option>
                {reasons.map((r) => (
                  <option key={r} value={r}>
                    {r.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="details" className="block text-sm font-medium text-gray-300 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500"
                rows={3}
                placeholder="Provide any additional context..."
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-gray-900 border border-red-600 rounded-md">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-300 hover:text-white"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAllVideoNotifications,
  reviewVideoNotification,
  VideoNotification,
} from '@/modules/shared-common/services/apiService';
import { Video, CheckCircle, XCircle, Clock, Play, X, Search } from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

function formatBytes(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [playingVideo, setPlayingVideo] = useState<VideoNotification | null>(null);
  const [reviewModal, setReviewModal] = useState<VideoNotification | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadVideos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllVideoNotifications();
      setVideos(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadVideos(); }, [loadVideos]);

  const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
    if (!reviewModal) return;
    setReviewing(true);
    try {
      await reviewVideoNotification(reviewModal.id, status, reviewNote);
      setReviewModal(null);
      setReviewNote('');
      setSuccessMsg(status === 'APPROVED' ? 'Video approved and notifications sent to attendees' : 'Video rejected');
      setTimeout(() => setSuccessMsg(''), 4000);
      await loadVideos();
    } catch { /* ignore */ } finally { setReviewing(false); }
  };

  const pending = videos.filter(v => v.status === 'PENDING').length;
  const approved = videos.filter(v => v.status === 'APPROVED').length;

  const filtered = videos.filter(v => {
    const matchStatus = !filterStatus || v.status === filterStatus;
    const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase()) ||
      (v.eventTitle || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.uploaderName || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Video className="w-8 h-8 text-violet-600" />
            Video Moderation
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Review and approve video notifications from organizers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Pending Review', value: pending, color: 'text-yellow-600', urgent: pending > 0 },
            { label: 'Total Approved', value: approved, color: 'text-green-600', urgent: false },
            { label: 'Total Videos', value: videos.length, color: 'text-slate-700 dark:text-slate-300', urgent: false },
          ].map(({ label, value, color, urgent }) => (
            <div key={label} className={`bg-white dark:bg-slate-900 rounded-xl p-4 border ${urgent ? 'border-yellow-300 dark:border-yellow-700' : 'border-slate-200 dark:border-slate-800'}`}>
              <p className="text-xs text-slate-400 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search videos..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex gap-4 items-center">
                <div className="w-20 h-14 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <Video className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No videos found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((video) => {
              const sc = statusConfig[video.status] || statusConfig.PENDING;
              return (
                <div key={video.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex gap-4 items-center">
                  {/* Preview thumbnail */}
                  <div
                    className="w-20 h-14 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-slate-800 transition-colors"
                    onClick={() => setPlayingVideo(video)}
                  >
                    <Play className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{video.title}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {video.eventTitle} · {video.uploaderName}
                        </p>
                        {video.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{video.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.color}`}>
                          {sc.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {video.fileSizeBytes && (
                        <span className="text-xs text-slate-400">{formatBytes(video.fileSizeBytes)}</span>
                      )}
                      <span className="text-xs text-slate-400">{new Date(video.createdAt).toLocaleDateString()}</span>
                      {video.status === 'APPROVED' && (
                        <span className="text-xs text-green-600">✓ {video.deliveryCount} delivered</span>
                      )}
                      {video.status === 'REJECTED' && video.reviewNote && (
                        <span className="text-xs text-red-500 truncate max-w-[200px]">{video.reviewNote}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {video.status === 'PENDING' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => setReviewModal(video)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 text-xs font-medium transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Review
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-black rounded-2xl overflow-hidden max-w-2xl w-full">
            <div className="flex items-center justify-between p-3 bg-slate-900">
              <div>
                <p className="text-white text-sm font-medium">{playingVideo.title}</p>
                <p className="text-slate-400 text-xs">{playingVideo.uploaderName} · {playingVideo.eventTitle}</p>
              </div>
              <button onClick={() => setPlayingVideo(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {playingVideo.videoUrl ? (
              <video src={playingVideo.videoUrl} controls autoPlay className="w-full max-h-96" />
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400">
                Video not available for preview
              </div>
            )}
            {playingVideo.status === 'PENDING' && (
              <div className="p-4 bg-slate-900 flex gap-3">
                <button
                  onClick={() => { setPlayingVideo(null); setReviewModal(playingVideo); }}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                >
                  Review Video
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Review Video</h2>
              <button onClick={() => setReviewModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className="font-medium text-slate-900 dark:text-white">{reviewModal.title}</p>
              <p className="text-sm text-slate-400">{reviewModal.uploaderName} · {reviewModal.eventTitle}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Review Note (optional)
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
                placeholder="Add a note for the organizer..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleReview('REJECTED')}
                disabled={reviewing}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 font-medium text-sm transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button
                onClick={() => handleReview('APPROVED')}
                disabled={reviewing}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" /> {reviewing ? 'Processing...' : 'Approve & Deliver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

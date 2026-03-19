'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getMyVideoNotifications,
  getMyEvents,
  uploadVideoNotification,
  VideoNotification,
} from '@/modules/shared-common/services/apiService';
import { Video, Upload, Play, Clock, CheckCircle, XCircle, X, AlertCircle } from 'lucide-react';

type Event = Awaited<ReturnType<typeof getMyEvents>>[number];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: {
    label: 'Pending Review',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  APPROVED: {
    label: 'Approved & Delivered',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function OrganizerVideosPage() {
  const [videos, setVideos] = useState<VideoNotification[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<VideoNotification | null>(null);

  const [form, setForm] = useState({ eventId: '', title: '', description: '' });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [videosData, eventsData] = await Promise.all([getMyVideoNotifications(), getMyEvents()]);
      setVideos(videosData);
      setEvents(eventsData.filter(e => ['active', 'ACTIVE', 'published', 'PUBLISHED'].includes(e.status)));
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setUploadError('');
    } else {
      setUploadError('Please drop a video file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setUploadError('File size must be under 50MB');
        return;
      }
      setVideoFile(file);
      setUploadError('');
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !form.eventId || !form.title) return;
    setUploading(true);
    setUploadProgress(0);
    setUploadError('');

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress(p => Math.min(p + 15, 85));
    }, 300);

    try {
      await uploadVideoNotification(form.eventId, form.title, form.description, videoFile);
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        setShowUpload(false);
        setForm({ eventId: '', title: '', description: '' });
        setVideoFile(null);
        setUploadProgress(0);
        loadData();
      }, 500);
    } catch (err) {
      clearInterval(interval);
      setUploadProgress(0);
      setUploadError('Upload failed. Please check file size (max 50MB) and try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Video className="w-8 h-8 text-violet-600" />
              Video Updates
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Send short video notifications to your event attendees
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
          >
            <Upload className="w-4 h-4" /> Upload Video
          </button>
        </div>

        {/* Policy Banner */}
        <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/50 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-violet-900 dark:text-violet-300">Video Policy</p>
            <p className="text-violet-700 dark:text-violet-400 mt-0.5">
              Videos are reviewed by our admin team before delivery. Max 50MB, videos should be relevant to your event.
              Once approved, all ticket holders receive a notification automatically.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Uploaded', value: videos.length, color: 'text-slate-700 dark:text-slate-300' },
            { label: 'Approved', value: videos.filter(v => v.status === 'APPROVED').length, color: 'text-green-600' },
            { label: 'Pending Review', value: videos.filter(v => v.status === 'PENDING').length, color: 'text-yellow-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="text-center p-8 text-slate-400">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <Video className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 mb-4">No videos uploaded yet</p>
            <button
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
            >
              Upload Your First Video
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => {
              const sc = statusConfig[video.status] || statusConfig.PENDING;
              return (
                <div key={video.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  {/* Video Thumbnail / Preview */}
                  <div className="bg-slate-900 h-40 flex items-center justify-center relative group cursor-pointer"
                    onClick={() => setPlayingVideo(video)}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </div>
                    </div>
                    <Video className="w-8 h-8 text-slate-600" />
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1">{video.title}</p>
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${sc.color}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>
                    {video.description && (
                      <p className="text-xs text-slate-400 mb-2 line-clamp-2">{video.description}</p>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Event: <span className="font-medium">{video.eventTitle}</span>
                    </p>
                    {video.fileSizeBytes && (
                      <p className="text-xs text-slate-400">{formatBytes(video.fileSizeBytes)}</p>
                    )}
                    {video.status === 'APPROVED' && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        ✓ Delivered to {video.deliveryCount} attendees
                      </p>
                    )}
                    {video.status === 'REJECTED' && video.reviewNote && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Reason: {video.reviewNote}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
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
              <p className="text-white text-sm font-medium">{playingVideo.title}</p>
              <button onClick={() => setPlayingVideo(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {playingVideo.videoUrl ? (
              <video
                src={playingVideo.videoUrl}
                controls
                autoPlay
                className="w-full max-h-96"
              />
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400">
                <p>Video not available for preview</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upload Video Notification</h2>
              <button onClick={() => setShowUpload(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Event *</label>
                <select
                  value={form.eventId}
                  onChange={(e) => setForm(p => ({ ...p, eventId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                >
                  <option value="">Select an event...</option>
                  {events.map(e => (
                    <option key={e.id} value={e.id}>{e.title || e.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Doors open early tonight!"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  placeholder="Optional note for attendees..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none"
                />
              </div>

              {/* Drop zone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Video File * (max 50MB)</label>
                <div
                  ref={dropZoneRef}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    videoFile
                      ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                      : 'border-slate-300 dark:border-slate-600 hover:border-violet-400 bg-slate-50 dark:bg-slate-800'
                  }`}
                >
                  {videoFile ? (
                    <div>
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">{videoFile.name}</p>
                      <p className="text-xs text-green-600">{formatBytes(videoFile.size)}</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Drag & drop a video file, or <span className="text-violet-600 hover:underline">browse</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">MP4, MOV, AVI — max 50MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {uploadProgress > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-violet-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadError && (
                <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUpload(false)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !videoFile || !form.eventId || !form.title}
                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors font-medium"
              >
                {uploading ? 'Uploading...' : 'Upload & Submit for Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

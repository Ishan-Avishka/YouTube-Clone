import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getVideos, deleteVideo } from '../services/api';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../context/AuthContext';
import './Channel.css';

function formatViews(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function Channel() {
  const { name } = useParams();
  const channelName = decodeURIComponent(name);
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const isOwner = user && user.username === channelName;

  useEffect(() => {
    fetchChannelVideos();
  }, [channelName]);

  const fetchChannelVideos = async () => {
    setLoading(true);
    try {
      const res = await getVideos('', channelName);
      setVideos(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await deleteVideo(videoId);
      setVideos(prev => prev.filter(v => v.id !== videoId));
    } catch (err) {
      alert('Failed to delete video');
    }
  };

  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);
  const totalLikes = videos.reduce((s, v) => s + (v.likes || 0), 0);

  return (
    <div className="channel-page">
      {/* Banner */}
      <div className="channel-banner">
        <div className="channel-banner-inner">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(channelName)}`}
            alt={channelName}
            className="channel-avatar"
          />
          <div className="channel-meta">
            <h1 className="channel-name">{channelName}</h1>
            <p className="channel-stats">
              {videos.length} video{videos.length !== 1 ? 's' : ''} •{' '}
              {formatViews(totalViews)} total views •{' '}
              {formatViews(totalLikes)} total likes
            </p>
          </div>
          {isOwner && (
            <a href="/upload" className="channel-upload-btn">
              + Upload Video
            </a>
          )}
        </div>
      </div>

      {/* Tabs / content */}
      <div className="channel-content">
        <div className="channel-section-header">
          <h2>Videos</h2>
        </div>

        {loading ? (
          <p className="channel-loading">Loading...</p>
        ) : videos.length === 0 ? (
          <div className="channel-empty">
            <div className="channel-empty-icon">📺</div>
            <h3>No videos yet</h3>
            {isOwner && (
              <a href="/upload" className="channel-upload-cta">Upload your first video</a>
            )}
          </div>
        ) : (
          <div className="channel-videos-grid">
            {videos.map(video => (
              <div key={video.id} className="channel-video-wrap">
                <VideoCard video={video} />
                {isOwner && (
                  <button
                    className="delete-video-btn"
                    onClick={() => handleDelete(video.id)}
                    title="Delete video"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

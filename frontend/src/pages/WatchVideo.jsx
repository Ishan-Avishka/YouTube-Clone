import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVideo, getVideos, likeVideo, incrementView } from '../services/api';
import CommentSection from '../components/CommentSection';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../context/AuthContext';
import './WatchVideo.css';

function formatViews(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

export default function WatchVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showDesc, setShowDesc] = useState(false);
  const viewCounted = useRef(false);

  useEffect(() => {
    setLoading(true);
    viewCounted.current = false;
    window.scrollTo(0, 0);
    loadVideo();
  }, [id]);

  const loadVideo = async () => {
    try {
      const [vRes, allRes] = await Promise.all([
        getVideo(id),
        getVideos()
      ]);
      const v = vRes.data;
      setVideo(v);
      setLikeCount(v.likes || 0);

      if (user && v.likedBy && v.likedBy.includes(user.id)) {
        setLiked(true);
      } else {
        setLiked(false);
      }

      setRelated(allRes.data.filter(rv => rv.id !== id).slice(0, 10));
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoPlay = async () => {
    if (!viewCounted.current) {
      viewCounted.current = true;
      try {
        const res = await incrementView(id);
        setVideo(prev => prev ? { ...prev, views: res.data.views } : prev);
      } catch {}
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like videos');
      return;
    }
    try {
      const res = await likeVideo(id, user.id);
      setLiked(res.data.liked);
      setLikeCount(res.data.likes);
    } catch {}
  };

  if (loading) {
    return (
      <div className="watch-page">
        <div className="watch-loading">
          <div className="watch-loading-player"></div>
          <div className="watch-loading-info">
            <div className="skeleton-line w80" style={{height:'20px'}}></div>
            <div className="skeleton-line w50" style={{height:'14px', marginTop:'12px'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!video) return null;

  const isDemo = !video.videoUrl || video.videoUrl === '';

  return (
    <div className="watch-page">
      <div className="watch-main">
        {/* Player */}
        <div className="player-wrap">
          {isDemo ? (
            <div className="demo-player">
              <img
                src={video.thumbnail && video.thumbnail.startsWith('http')
                  ? video.thumbnail
                  : `https://picsum.photos/seed/${video.id}/1280/720`}
                alt={video.title}
                className="demo-thumb"
              />
              <div className="demo-overlay">
                <div className="demo-icon">▶</div>
                <p>Demo video — upload a real video to play</p>
              </div>
            </div>
          ) : (
            <video
              className="video-player"
              controls
              onPlay={handleVideoPlay}
              key={video.videoUrl}
            >
              <source src={video.videoUrl} />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Video info */}
        <div className="video-info-section">
          <h1 className="watch-title">{video.title}</h1>

          <div className="watch-actions-bar">
            <div className="watch-channel-info">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(video.channel)}`}
                alt={video.channel}
                className="watch-channel-avatar"
                onClick={() => navigate(`/channel/${encodeURIComponent(video.channel)}`)}
                style={{ cursor: 'pointer' }}
              />
              <div>
                <p
                  className="watch-channel-name"
                  onClick={() => navigate(`/channel/${encodeURIComponent(video.channel)}`)}
                >
                  {video.channel}
                </p>
                <p className="watch-views-date">
                  {formatViews(video.views)} views • {formatDate(video.uploadDate)}
                </p>
              </div>
            </div>

            <div className="watch-buttons">
              <button
                className={`like-btn ${liked ? 'liked' : ''}`}
                onClick={handleLike}
              >
                <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                  <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                </svg>
                <span>{likeCount}</span>
              </button>

              <button
                className="share-btn"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('Link copied!');
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Share
              </button>
            </div>
          </div>

          {/* Description */}
          <div className={`description-box ${showDesc ? 'expanded' : ''}`}>
            <div className="description-text">
              {video.description || 'No description provided.'}
            </div>
            {video.description && video.description.length > 100 && (
              <button className="show-more-btn" onClick={() => setShowDesc(p => !p)}>
                {showDesc ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Comments */}
          <CommentSection videoId={id} />
        </div>
      </div>

      {/* Sidebar related */}
      <aside className="related-sidebar">
        <h3 className="related-title">Up next</h3>
        <div className="related-list">
          {related.map(v => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </aside>
    </div>
  );
}

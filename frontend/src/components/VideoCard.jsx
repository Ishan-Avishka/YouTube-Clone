import { useNavigate } from 'react-router-dom';
import './VideoCard.css';

function formatViews(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K views`;
  return `${n} views`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const months = Math.floor(diff / (86400000 * 30));
  const years = Math.floor(diff / (86400000 * 365));
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (mins > 0) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  return 'Just now';
}

export default function VideoCard({ video }) {
  const navigate = useNavigate();

  const thumbnailSrc = video.thumbnail
    ? video.thumbnail.startsWith('http')
      ? video.thumbnail
      : video.thumbnail
    : `https://picsum.photos/seed/${video.id}/640/360`;

  return (
    <div className="video-card" onClick={() => navigate(`/watch/${video.id}`)}>
      <div className="video-thumb-wrap">
        <img
          src={thumbnailSrc}
          alt={video.title}
          className="video-thumb"
          onError={e => {
            e.target.src = `https://picsum.photos/seed/${video.id}/640/360`;
          }}
        />
        {video.category && (
          <span className="video-category-badge">{video.category}</span>
        )}
      </div>
      <div className="video-info">
        <div className="video-avatar">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(video.channel)}`}
            alt={video.channel}
          />
        </div>
        <div className="video-meta">
          <h3 className="video-title">{video.title}</h3>
          <p
            className="video-channel"
            onClick={e => {
              e.stopPropagation();
              navigate(`/channel/${encodeURIComponent(video.channel)}`);
            }}
          >
            {video.channel}
          </p>
          <p className="video-stats">
            {formatViews(video.views)} • {timeAgo(video.uploadDate)}
          </p>
        </div>
      </div>
    </div>
  );
}

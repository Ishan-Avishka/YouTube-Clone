import { useState, useEffect } from 'react';
import { getComments, addComment, deleteComment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './CommentSection.css';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (mins > 0) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  return 'Just now';
}

export default function CommentSection({ videoId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      const res = await getComments(videoId);
      setComments(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setSubmitting(true);
    try {
      const res = await addComment(videoId, user.username, text.trim());
      setComments(prev => [res.data, ...prev]);
      setText('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="comments">
      <h3 className="comments-title">{comments.length} Comments</h3>

      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <img
            src={user.avatar}
            alt={user.username}
            className="comment-avatar"
          />
          <div className="comment-input-wrap">
            <textarea
              className="comment-input"
              placeholder="Add a comment..."
              value={text}
              onChange={e => setText(e.target.value)}
              rows={1}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
            <div className="comment-actions">
              <button
                type="button"
                className="comment-cancel"
                onClick={() => setText('')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="comment-submit"
                disabled={!text.trim() || submitting}
              >
                Comment
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="comment-signin-hint">Sign in to add a comment</p>
      )}

      {loading ? (
        <div className="comments-loading">Loading comments...</div>
      ) : (
        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first!</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="comment-item">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.user)}`}
                  alt={c.user}
                  className="comment-avatar"
                />
                <div className="comment-body">
                  <div className="comment-header">
                    <span className="comment-user">@{c.user}</span>
                    <span className="comment-time">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="comment-text">{c.text}</p>
                </div>
                {user && user.username === c.user && (
                  <button
                    className="comment-delete"
                    onClick={() => handleDelete(c.id)}
                    title="Delete comment"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

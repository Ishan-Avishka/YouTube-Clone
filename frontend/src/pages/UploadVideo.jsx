import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadVideo } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './UploadVideo.css';

const CATEGORIES = ['general', 'education', 'music', 'gaming', 'technology', 'science', 'cooking', 'sports', 'news'];

export default function UploadVideo() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const videoInputRef = useRef();
  const thumbInputRef = useRef();

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleThumbChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setThumbPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Please sign in to upload videos');
      return;
    }

    if (!title.trim()) { setError('Title is required'); return; }
    if (!videoFile) { setError('Please select a video file'); return; }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('channel', user.username);
    formData.append('category', category);
    formData.append('video', videoFile);
    if (thumbFile) formData.append('thumbnail', thumbFile);

    setUploading(true);
    // Fake progress
    const interval = setInterval(() => {
      setProgress(p => (p < 85 ? p + Math.random() * 15 : p));
    }, 300);

    try {
      const res = await uploadVideo(formData);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => navigate(`/watch/${res.data.id}`), 600);
    } catch (err) {
      clearInterval(interval);
      setProgress(0);
      setError(err.response?.data?.message || 'Upload failed. Try again.');
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <div className="upload-header">
          <h1>Upload Video</h1>
          <p>Share your video with the world</p>
        </div>

        {!user && (
          <div className="upload-alert">
            ⚠️ Please sign in (top right) before uploading
          </div>
        )}

        {error && <div className="upload-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="upload-form">
          {/* Video drop zone */}
          <div
            className={`video-drop-zone ${videoFile ? 'has-file' : ''}`}
            onClick={() => videoInputRef.current.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file && file.type.startsWith('video/')) {
                setVideoFile(file);
                setVideoPreview(URL.createObjectURL(file));
              }
            }}
          >
            {videoPreview ? (
              <video src={videoPreview} controls className="video-preview" onClick={e => e.stopPropagation()} />
            ) : (
              <div className="drop-zone-inner">
                <div className="drop-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                  </svg>
                </div>
                <p className="drop-main">Drag & drop or click to select video</p>
                <p className="drop-sub">MP4, WebM, AVI, MOV up to 500MB</p>
              </div>
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              style={{ display: 'none' }}
            />
          </div>

          {videoFile && (
            <p className="file-name-tag">
              📁 {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
            </p>
          )}

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter a descriptive title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
              required
            />
            <span className="char-count">{title.length}/100</span>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Describe your video..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={2000}
              rows={4}
            />
            <span className="char-count">{description.length}/2000</span>
          </div>

          {/* Row: category + thumbnail */}
          <div className="form-row">
            <div className="form-group" style={{flex: 1}}>
              <label className="form-label">Category</label>
              <select
                className="form-input form-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group thumb-group" style={{flex: 1}}>
              <label className="form-label">Thumbnail (optional)</label>
              <div
                className={`thumb-drop ${thumbPreview ? 'has-thumb' : ''}`}
                onClick={() => thumbInputRef.current.click()}
              >
                {thumbPreview ? (
                  <img src={thumbPreview} alt="Thumbnail preview" className="thumb-preview" />
                ) : (
                  <div className="thumb-placeholder">
                    <span>🖼️</span>
                    <p>Click to add thumbnail</p>
                  </div>
                )}
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {uploading && (
            <div className="progress-wrap">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="progress-text">{progress < 100 ? `Uploading... ${Math.round(progress)}%` : 'Done! Redirecting...'}</p>
            </div>
          )}

          <button
            type="submit"
            className="upload-btn"
            disabled={uploading || !user}
          >
            {uploading ? 'Uploading...' : 'Publish Video'}
          </button>
        </form>
      </div>
    </div>
  );
}

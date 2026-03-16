import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { getVideos } from '../services/api';
import './Home.css';

const CATEGORIES = ['All', 'Education', 'Music', 'Gaming', 'Technology', 'Science', 'Cooking', 'Sports'];

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const category = activeCategory === 'All' ? '' : activeCategory.toLowerCase();
      const res = await getVideos(searchQuery, '');
      let data = res.data;

      if (category) {
        data = data.filter(v =>
          (v.category || '').toLowerCase() === category ||
          v.title.toLowerCase().includes(category) ||
          v.description.toLowerCase().includes(category)
        );
      }

      setVideos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeCategory]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return (
    <div className="home">
      <div className="categories-bar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {searchQuery && (
        <div className="search-results-info">
          <h2>Search results for "<span>{searchQuery}</span>"</h2>
          <p>{videos.length} video{videos.length !== 1 ? 's' : ''} found</p>
        </div>
      )}

      {loading ? (
        <div className="videos-grid">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="video-skeleton">
              <div className="skeleton-thumb"></div>
              <div className="skeleton-info">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-lines">
                  <div className="skeleton-line w80"></div>
                  <div className="skeleton-line w50"></div>
                  <div className="skeleton-line w60"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="no-videos">
          <div className="no-videos-icon">📺</div>
          <h3>No videos found</h3>
          <p>Try a different search or category</p>
        </div>
      ) : (
        <div className="videos-grid">
          {videos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Storage config for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') {
      cb(null, path.join(__dirname, '../uploads/videos'));
    } else {
      cb(null, path.join(__dirname, '../uploads/thumbnails'));
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      if (!file.mimetype.startsWith('video/')) {
        return cb(new Error('Only video files allowed'));
      }
    } else if (file.fieldname === 'thumbnail') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files allowed'));
      }
    }
    cb(null, true);
  }
});

const videosPath = path.join(__dirname, '../data/videos.json');

const readVideos = () => {
  try {
    return JSON.parse(fs.readFileSync(videosPath, 'utf-8'));
  } catch {
    return [];
  }
};

const writeVideos = (data) => {
  fs.writeFileSync(videosPath, JSON.stringify(data, null, 2));
};

// GET all videos (with optional search)
router.get('/', (req, res) => {
  const videos = readVideos();
  const { search, channel } = req.query;

  let filtered = videos;

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(v =>
      v.title.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      v.channel.toLowerCase().includes(q) ||
      (v.category && v.category.toLowerCase().includes(q))
    );
  }

  if (channel) {
    filtered = filtered.filter(v => v.channel === channel);
  }

  // Return newest first
  filtered.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  res.json(filtered);
});

// GET single video
router.get('/:id', (req, res) => {
  const videos = readVideos();
  const video = videos.find(v => v.id === req.params.id);
  if (!video) return res.status(404).json({ message: 'Video not found' });
  res.json(video);
});

// POST upload video
router.post('/upload', upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), (req, res) => {
  try {
    const { title, description, channel, category } = req.body;

    if (!req.files.video) return res.status(400).json({ message: 'Video file required' });
    if (!title || !channel) return res.status(400).json({ message: 'Title and channel required' });

    const videos = readVideos();
    const newVideo = {
      id: uuidv4(),
      title,
      description: description || '',
      channel,
      category: category || 'general',
      videoUrl: `/uploads/videos/${req.files.video[0].filename}`,
      thumbnail: req.files.thumbnail
        ? `/uploads/thumbnails/${req.files.thumbnail[0].filename}`
        : null,
      views: 0,
      likes: 0,
      dislikes: 0,
      likedBy: [],
      uploadDate: new Date().toISOString()
    };

    videos.push(newVideo);
    writeVideos(videos);
    res.status(201).json(newVideo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST increment views
router.post('/:id/view', (req, res) => {
  const videos = readVideos();
  const idx = videos.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Video not found' });

  videos[idx].views = (videos[idx].views || 0) + 1;
  writeVideos(videos);
  res.json({ views: videos[idx].views });
});

// POST like/unlike video
router.post('/:id/like', (req, res) => {
  const { userId } = req.body;
  const videos = readVideos();
  const idx = videos.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Video not found' });

  const video = videos[idx];
  if (!video.likedBy) video.likedBy = [];

  const alreadyLiked = video.likedBy.includes(userId);
  if (alreadyLiked) {
    video.likedBy = video.likedBy.filter(id => id !== userId);
    video.likes = Math.max(0, (video.likes || 0) - 1);
  } else {
    video.likedBy.push(userId);
    video.likes = (video.likes || 0) + 1;
  }

  writeVideos(videos);
  res.json({ likes: video.likes, liked: !alreadyLiked });
});

// DELETE video
router.delete('/:id', (req, res) => {
  const videos = readVideos();
  const idx = videos.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Video not found' });

  const video = videos[idx];

  // Delete files
  const videoFile = path.join(__dirname, '..', video.videoUrl);
  const thumbFile = video.thumbnail ? path.join(__dirname, '..', video.thumbnail) : null;
  if (fs.existsSync(videoFile)) fs.unlinkSync(videoFile);
  if (thumbFile && fs.existsSync(thumbFile)) fs.unlinkSync(thumbFile);

  videos.splice(idx, 1);
  writeVideos(videos);
  res.json({ message: 'Video deleted' });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const commentsPath = path.join(__dirname, '../data/comments.json');

const readComments = () => {
  try {
    return JSON.parse(fs.readFileSync(commentsPath, 'utf-8'));
  } catch {
    return [];
  }
};

const writeComments = (data) => {
  fs.writeFileSync(commentsPath, JSON.stringify(data, null, 2));
};

// GET comments for a video
router.get('/:videoId', (req, res) => {
  const comments = readComments();
  const videoComments = comments
    .filter(c => c.videoId === req.params.videoId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(videoComments);
});

// POST add comment
router.post('/', (req, res) => {
  const { videoId, user, text } = req.body;
  if (!videoId || !user || !text) {
    return res.status(400).json({ message: 'videoId, user, and text are required' });
  }

  const comments = readComments();
  const newComment = {
    id: uuidv4(),
    videoId,
    user,
    text,
    createdAt: new Date().toISOString()
  };

  comments.push(newComment);
  writeComments(comments);
  res.status(201).json(newComment);
});

// DELETE comment
router.delete('/:id', (req, res) => {
  const comments = readComments();
  const idx = comments.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Comment not found' });

  comments.splice(idx, 1);
  writeComments(comments);
  res.json({ message: 'Comment deleted' });
});

module.exports = router;

import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const getVideos = (search = '', channel = '') =>
  API.get(`/videos?search=${search}&channel=${channel}`);

export const getVideo = (id) => API.get(`/videos/${id}`);

export const uploadVideo = (formData) =>
  API.post('/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const incrementView = (id) => API.post(`/videos/${id}/view`);

export const likeVideo = (id, userId) =>
  API.post(`/videos/${id}/like`, { userId });

export const deleteVideo = (id) => API.delete(`/videos/${id}`);

export const getComments = (videoId) => API.get(`/comments/${videoId}`);

export const addComment = (videoId, user, text) =>
  API.post('/comments', { videoId, user, text });

export const deleteComment = (id) => API.delete(`/comments/${id}`);

export const authUser = (username) =>
  API.post('/users/auth', { username });

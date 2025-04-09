import React, { useState } from 'react';
import axios from 'axios';

const FeedForm: React.FC = () => {
  const [text, setText] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('user_id', '1'); // 기본 사용자 (예시)
    formData.append('text', text);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    if (image) {
      formData.append('image', image);
    }

    try {
      await axios.post("http://localhost:5000/feeds", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setText('');
      setLatitude('');
      setLongitude('');
      setImage(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form className="mb-4" onSubmit={handleSubmit}>
      <textarea
        className="w-full p-2 border rounded"
        placeholder="Share your experience..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <div className="flex space-x-2 mt-2">
        <input
          type="text"
          className="w-1/2 p-2 border rounded"
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          required
        />
        <input
          type="text"
          className="w-1/2 p-2 border rounded"
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          required
        />
      </div>
      <input
        type="file"
        className="mt-2"
        accept="image/*"
        onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
      />
      <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Post</button>
    </form>
  );
};

export default FeedForm;
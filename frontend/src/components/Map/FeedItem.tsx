import React from 'react';

interface FeedItemProps {
  feed: any;
}

const FeedItem: React.FC<FeedItemProps> = ({ feed }) => {
  return (
    <div className="border p-4 my-2 rounded">
      <div className="text-sm text-gray-500">Sentiment: {feed.sentiment}</div>
      <div>{feed.text}</div>
      {feed.image && (
        <img src={`http://localhost:5000/uploads/${feed.image}`} alt="feed" className="mt-2" />
      )}
      {/* 좋아요, 댓글 버튼 및 로직 추가 가능 */}
    </div>
  );
};

export default FeedItem;
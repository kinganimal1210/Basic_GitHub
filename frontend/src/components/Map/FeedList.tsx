import React from 'react';
import FeedItem from './FeedItem';

interface FeedListProps {
  feeds: any[];
}

const FeedList: React.FC<FeedListProps> = ({ feeds }) => {
  return (
    <div>
      {feeds.map(feed => (
        <FeedItem key={feed.id} feed={feed} />
      ))}
    </div>
  );
};

export default FeedList;
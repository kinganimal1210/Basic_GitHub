import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import MapComponent from './components/MapComponents';
// import FeedList from './components/FeedList';
// import FeedForm from './components/FeedForm';
import {DefaultDemo} from "./components/header/Navbar";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const App: React.FC = () => {
  const [feeds, setFeeds] = useState<any[]>([]);

  useEffect(() => {
    // 초기 피드 데이터 로드
    fetch("http://localhost:5000/feeds")
      .then(res => res.json())
      .then(data => setFeeds(data))
      .catch(err => console.error(err));

    // 실시간 업데이트: 새 피드 수신
    socket.on("new_feed", (data) => {
      setFeeds(prevFeeds => [data, ...prevFeeds]);
    });

    return () => {
      socket.off("new_feed");
    }
  }, []);

  return (
    <>
      <div className="relative z-10 flex flex-col gap-4 bg-white p-4">
        <DefaultDemo />
      </div>
      <div className="absolute inset-0 z-0">
        <MapComponent feeds={feeds} />
      </div>
      {/* <div className="w-full md:w-1/3 h-screen overflow-y-auto p-4">
        <FeedForm />
        <FeedList feeds={feeds} />
      </div> */}
    </>
  );
};

export default App;
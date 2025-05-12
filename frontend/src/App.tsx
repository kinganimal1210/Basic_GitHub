import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import MapComponent from './components/Map/MapComponents';
// import FeedList from './components/FeedList';
// import FeedForm from './components/FeedForm';
import { io } from "socket.io-client";
import MyMenu from './components/Menu/Mymenu';
import CustomButton from './components/Marker/MapMarker';

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
    <header >
      <div className="relative z-50 flex justify-between items-center p-4 bg-transparent text-white pointer-events-none">
        <h1 className="text-xl font-bold text-gray-600 pointer-events-auto">LOGO</h1>
        <MyMenu />
      </div>
    </header>
    <main>
      <div className="absolute inset-0 z-0">  
        <MapComponent feeds={feeds} />
      </div>
      {/* <div className="w-full md:w-1/3 h-screen overflow-y-auto p-4">
              <FeedForm />
              <FeedList feeds={feeds} />
            </div> */}
    </main>
    <footer className="absolute bottom-0 left-0 w-full bg-transparent text-white pointer-events-none">
      <div className="relative z-50 flex justify-end items-center p-4 bg-transparent text-white pointer-events-none">
        <CustomButton label="Make Marker!" onClick={() => alert("Make Markers!")} />
      </div>
      </footer>
    </>
  );
};

export default App;
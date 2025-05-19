// Module Import
import React, { useEffect, useState } from 'react'; // React.FC type 선언, 생명주기 훅 사용
import { Routes, Route, Link } from 'react-router-dom'; // Routes 추후 페이지 전환기능을 위해 사용
// import FeedList from './components/FeedList';
// import FeedForm from './components/FeedForm';
import { io } from "socket.io-client"; // 백엔드 Flask, Socket.io와 연결하기 위한 라이브러리
import MyMenu from './components/Menu/Mymenu';
import CustomButton from './components/Marker/MapMarker';
import MapComponent from './components/Map/MapComponents';
import UnderAvatar from './components/Avatar/UnderAvatar';

const socket = io("http://localhost:5000"); // socket.io 서버와 연결, 새로운 피드 데이터를 실시간으로 받아올 수 있음


// App 컴포넌트 정의
const App: React.FC = () => {

  // 구글 맵 객체를 저장하기 위한 상태 변수, 초기값은 null
  const [map, setMap] = useState<google.maps.Map | null>(null); 

  // 마커 추가 함수
  const addMarker = ({ lat, lng }: { lat: number; lng: number }) => {
    if (!map) return;
    new google.maps.Marker({ position: { lat, lng }, map });
  };
  
  const [feeds, setFeeds] = useState<any[]>([]); // 서버 에서 받아온 피드 데이터를 저장하기 위한 상태 변수, 초기값은 빈 배열
  
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
    // 소켓 연결 해제
    // 컴포넌트 언마운트 시 소켓 연결 해제
    return () => {
      socket.off("new_feed");
    }
  }, []);

  // JSX 구성
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
        <MapComponent feeds={feeds} onMapLoad={setMap}/>
      </div>
      {/* <div className="w-full md:w-1/3 h-screen overflow-y-auto p-4">
              <FeedForm />
              <FeedList feeds={feeds} />
            </div> */}
    </main>
    <footer className="absolute bottom-0 left-0 w-full bg-transparent text-white pointer-events-none">
      <div className="relative z-50 flex justify-end items-center p-4 bg-transparent text-white pointer-events-none">
        {/* <UnderAvatar/> */}
        <CustomButton map={map!} addMarker={addMarker} label="Make Marker!" />
      </div>
      </footer>
    </>
  );
};

export default App;
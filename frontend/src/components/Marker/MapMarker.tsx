// src/components/CustomButton.tsx
// Module Imports
import React from 'react'; // React Component 작성에 필요한 기본 라이브러리
import { Button, KIND, SIZE, ButtonProps } from 'baseui/button'; // BaseUI 라이브러리에서 제공하는 Button 컴포넌트와 스타일링을 위한 상수들

// CustomButton 컴포넌트 Props 타입 정의
type Props = ButtonProps & {
  label: string;
  map: google.maps.Map; // 구글 맵 객체를 prop으로 받아옴, .addListener나 .Marker를 사용하기 위해 필요
  addMarker: (coords: { lat: number; lng: number }) => void; // 마커 추가 로직을 위임받을 함수
};

// CustomButton 컴포넌트 정의
const CustomButton: React.FC<Props> = ({ label, map, addMarker, ...rest}) => { // label prop을 써서 동적으로 변경 가능
  const activateMarkerMode = () => {

    if (!map) return; //지금 이게 문제인듯 <- map이 null일 경우 리턴 !

    map.setOptions({ draggableCursor: 'crosshair' }); // 마우스 커서를 십자 모양으로 변경

    const listener = map.addListener("click", (event: google.maps.MapMouseEvent) => {

      if (!event.latLng) return;
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      google.maps.event.removeListener(listener);

      const intro = prompt("마커에 대한 설명을 입력하세요"); // 마커에 대한 설명을 입력받는 프롬프트 <- 이 부분은 나중에 백엔드 연결

      map.setOptions({ draggableCursor: 'default' }); // 마우스 커서를 기본으로 변경

      if (!intro) return;
      addMarker({ lat, lng });
    });
  };

  return (
    <div style={{ pointerEvents: 'auto'}}>
      <Button 
        onClick={activateMarkerMode}
        kind={KIND.secondary} // 시작적 스타일을 위한 KIND 설정
        size={SIZE.compact} // 버튼 크기 설정s
        {...rest}
      >
        {label} {/* 버튼에 표시될 텍스트 */}
      </Button> 
    </div>
  );
};

// CustomButton 컴포넌트 내보내기
export default CustomButton;
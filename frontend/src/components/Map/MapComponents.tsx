import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface MapComponentProps {
  feeds: any[];
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 37.5665,
  lng: 126.9780
};

const mapOptions = {
  disableDefaultUI: true,
  draggableCursor: "default",
  draggingCursor: "pointer",
  styles: [
    {
      featureType: "administrative",
      elementType: "labels",
      stylers: [
        {
          visibility: "off"
        }
      ] 
    },

    {
      featureType: "poi",
      elementType: "labels",
      stylers: [
        {
          visibility: "off"
        }
      ]
    },
    {
      featureType: "landscape",
      elementType: "labels",
      stylers: [
        {
          visibility: "off"
        }
      ]
    },
    {
      featureType: "road.highway",
      elementType: "labels",
      stylers: [
        {
          visibility: "off"
        }
      ]
    }
  ]
};
// Google Maps API Key는 환경변수로 관리하는 것이 좋음 googleMapsApiKey="" 에 Api key입력.
// process.env.REACT_APP_GOOGLE_MAPS_API_KEY  

const MapComponent: React.FC<MapComponentProps> = ({ feeds }) => {
  return (
    //AIzaSyCAitJS8w-JCK90vmJvhnJrQirFwAyyGPI <-Google Maps API Key
    <LoadScript googleMapsApiKey="AIzaSyCAitJS8w-JCK90vmJvhnJrQirFwAyyGPI">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        options={mapOptions}
      >
        {feeds.map(feed => (
          <Marker
            key={feed.id}
            position={{
              lat: Number(feed.latitude) || center.lat,
              lng: Number(feed.longitude) || center.lng
            }}
            // onClick 이벤트 추가하여 상세 정보 표시 가능
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
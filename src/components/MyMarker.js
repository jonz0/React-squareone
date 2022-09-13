import React, { useState } from "react";
import { MarkerF, InfoWindowF } from "@react-google-maps/api";

export default function MyMarker({ marker }) {
  const [popupShowing, setPopupShowing] = useState(false);
  let markerPos = { lat: marker.latitude, lng: marker.longitude };

  function handlePopupShowing() {
    setPopupShowing(!popupShowing);
  }

  return (
    <MarkerF position={markerPos} onClick={handlePopupShowing}>
      {popupShowing && (
        <InfoWindowF
          position={markerPos}
          onCloseclick={() => {
            console.log("lol");
          }}
        >
          <div>
            <h1>Test</h1>
          </div>
        </InfoWindowF>
      )}
    </MarkerF>
  );
}

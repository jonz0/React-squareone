import React from "react";
import { useJsApiLoader, GoogleMap, Polyline } from "@react-google-maps/api";

export default function Line(line) {
  // console.log("start")
  // console.log(line);
  // console.log("test: " + line.lit);
  const coordinates = [
    // { lat: 37.772, lng: -122.214 },
    // { lat: 21.291, lng: -157.821 },
    { lat: line.line.lat1, lng: line.line.long1 },
    { lat: line.line.lat2, lng: line.line.long2 },
  ];

  return (
    <div>
      <Polyline
        path={coordinates}
        geodesic={true}
        options={{
          strokeColor: "#ff2527",
          strokeOpacity: 0.75,
          strokeWeight: 2,
        }}
      />
    </div>
  );
}

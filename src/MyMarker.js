import React from "react";
import { MarkerF } from "@react-google-maps/api";

export default function MyMarker({ marker }) {
  let markerPos = { lat: marker.latitude, lng: marker.longitude };
  return <MarkerF position={markerPos} />;
}

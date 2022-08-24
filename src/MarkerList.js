import React from "react";
import MyMarker from "./MyMarker";

export default function MarkerList({ markers }) {
  return markers.map((marker) => {
    return <MyMarker marker={marker} />;
  });
}

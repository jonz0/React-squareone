import React from "react";
import MyMarker from "./MyMarker";
import { v4 as uuidv4 } from "uuid";

export default function MarkerList({ markers }) {
  return markers.map((marker) => {
    return <MyMarker key={uuidv4()} marker={marker} />;
  });
}

import React from "react";
import MyMarker from "./MyMarker";
import { v4 as uuidv4 } from "uuid";

export default function MarkerList({ markers }) {
  /* Needs to get deleted marker ID passed to it, then remove the correct marker from markers before mapping */
  function deleteMarker() {}

  return markers.map((marker) => {
    return <MyMarker key={uuidv4()} marker={marker} />;
  });
}

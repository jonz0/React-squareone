import { React, useState } from "react";
import MyMarker from "./MyMarker";
import { v4 as uuidv4 } from "uuid";

export default function MarkerList({ markers }) {
  const [markerList, setMarkerList] = useState(markers);
  /* Needs to get deleted marker ID passed to it, then remove the correct marker from markers before mapping */
  function deleteMarker(id) {
    let temp = markers;
    delete temp[id];
    setMarkerList(temp);
    console.log("deleting marker...");
    console.log("marker deleted");
  }

  return Object.values(markers).map((marker) => {
    return (
      <MyMarker key={uuidv4()} marker={marker} deleteMarker={deleteMarker} />
    );
  });
}

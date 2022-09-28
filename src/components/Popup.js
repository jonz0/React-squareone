import React from "react";
import { OverlayView } from "@react-google-maps/api";

const getPixelPositionOffset = (pixelOffset) => (width, height) => ({
  x: -(width / 2) + pixelOffset.x,
  y: -(height / 2) + pixelOffset.y,
});

function Popup(props) {
  console.log("rendering popup");
  console.log(
    "overlay pos: " + props.anchorPosition.lat + ", " + props.anchorPosition.lng
  );
  return (
    <OverlayView
      position={props.anchorPosition}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={getPixelPositionOffset(props.markerPixelOffset)}
    >
      <div className="popup-tip-anchor">
        <div className="popup-bubble-anchor">
          <div className="popup-bubble-content">
            <h1>{props.content}</h1>
          </div>
        </div>
      </div>
    </OverlayView>
  );
}

export default Popup;

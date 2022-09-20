import React, { useState } from "react";
import { MarkerF, InfoWindowF } from "@react-google-maps/api";
import { useAuth } from "../contexts/AuthContext";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { storage, db, auth, newPostKey } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, child, push, update } from "firebase/database";

export default function MyMarker({ marker }) {
  const { currentUser, logout } = useAuth();
  const [popupShowing, setPopupShowing] = useState(false);
  let markerPos = { lat: marker.latitude, lng: marker.longitude };
  const markerRef = doc(db, "users", currentUser.uid, "markers", marker.key);

  async function fetchImage() {
    const docSnap = await getDoc(markerRef);
    const imageRef = ref(storage, docSnap.data().imageRef);
    return getDownloadURL(imageRef);
  }

  function handlePopupShowing() {
    setPopupShowing(!popupShowing);
    fetchImage();
    console.log(marker.key);
    console.log({ fetchImage });
  }

  return (
    <MarkerF position={markerPos} onClick={handlePopupShowing}>
      {popupShowing && (
        <InfoWindowF
          position={markerPos}
          onCloseclick={() => {
            console.log("marker closed");
          }}
        >
          <div>
            <img src={fetchImage}></img>
            <p>Test</p>
          </div>
        </InfoWindowF>
      )}
    </MarkerF>
  );
}

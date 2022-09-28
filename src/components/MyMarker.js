import React, { useState, useEffect, useRef } from "react";
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
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { getDatabase, child, push, update } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import "../css/App.css";
import Popup from "./Popup";

export default function MyMarker({ marker }) {
  const { currentUser, logout } = useAuth();
  const [popupShowing, setPopupShowing] = useState(false);
  const currentUserId = currentUser.uid;
  const markerRef = doc(db, "users", currentUserId, "markers", marker.key);
  const [imageList, setImageList] = useState([]);
  let markerPos = { lat: marker.latitude, lng: marker.longitude };
  let [content, setContent] = useState("");

  useEffect(() => {
    fetchImagesRef();
  }, []);

  async function fetchImagesRef() {
    // console.log("fetching...");
    console.log("marker position: " + markerPos.lat + ", " + markerPos.lng);
    const docSnap = await getDoc(markerRef);
    const images = `${currentUserId}/${docSnap.data().imagesRef}`;
    // console.log(docSnap.exists());
    // console.log(imagesRef);
    setContent(docSnap.data().city + ", " + docSnap.data().country);

    if (docSnap.exists()) {
      listAll(ref(storage, images)).then((response) => {
        response.items.forEach((item) => {
          getDownloadURL(item).then((url) => {
            setImageList((prev) => [...prev, url]);
          });
        });
      });
    } else {
      console.log("Error: please contact the big boss");
    }
  }

  async function handlePopupShowing() {
    if (popupShowing) {
      console.log("popup showing");
    } else {
      console.log("popup hidden");
    }
    setPopupShowing(!popupShowing);
    // console.log("content: " + content);
  }

  return (
    <>
      <MarkerF position={markerPos} onClick={handlePopupShowing}>
        {/* {popupShowing && (
        <InfoWindowF
          position={markerPos}
          onCloseClick={() => {
            setPopupShowing(false);
          }}
        >
          <div>
            {imageList.map((url) => {
              return <img key={uuidv4()} src={url} id="marker-image" />;
            })}
            <p>Test</p>
          </div>
        </InfoWindowF>
      )} */}
      </MarkerF>
      {popupShowing && (
        <Popup
          anchorPosition={{ lat: markerPos.lat, lng: markerPos.lng }}
          markerPixelOffset={{ x: 0, y: -45 }}
          // content={content}
          content={content}
        />
      )}
    </>
  );
}

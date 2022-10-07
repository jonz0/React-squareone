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
  deleteDoc,
} from "firebase/firestore";
import { storage, db, auth, newPostKey } from "../firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import { getDatabase, child, push, update } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import "../css/App.css";
import MyMarker from "./MyMarker";

export default function MarkerList({ markers }) {
  const { currentUser, logout } = useAuth();
  const currentUserId = currentUser.uid;
  /* Needs to get deleted marker ID passed to it, then remove the correct marker from markers before mapping */

  async function handleDelete(id) {
    const markerRef = doc(db, "users", currentUserId, "markers", id);
    const docSnap = await getDoc(markerRef);
    const images = `${currentUserId}/${docSnap.data().imagesRef}/${
      docSnap.data().hash
    }`;
    deleteObject(ref(storage, images))
      .then(() => {
        console.log("File deleted successfully");
      })
      .catch((error) => {
        console.log("Uh-oh, an error occurred!");
      });
    const hashRef = `${currentUserId}/imageHashes/${docSnap.data().hash}`;
    const imageRef = doc(db, "users", hashRef);
    await deleteDoc(markerRef);
    await deleteDoc(imageRef);
  }

  return Object.values(markers).map((marker) => {
    return (
      <MyMarker key={uuidv4()} marker={marker} handleDelete={handleDelete} />
    );
  });
}

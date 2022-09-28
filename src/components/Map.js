import React, { useEffect, useState, useRef } from "react";
import { Box, Flex, Input } from "@chakra-ui/react";
import { useJsApiLoader, GoogleMap } from "@react-google-maps/api";
import MarkerList from "./MarkerList";
import { v4 as uuidv4 } from "uuid";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { storage, db, auth, newPostKey } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, child, push, update } from "firebase/database";
import { Form, Button, Card, Alert } from "react-bootstrap";
import exifr, { gps } from "exifr";
import { SHA3 } from "crypto-js";

const center = { lat: 0, lng: 0 };
const readerBuffer = new FileReader();

export default function Map() {
  const [markers, setMarkers] = useState([]);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });
  const { currentUser, logout } = useAuth();
  const currentUserId = currentUser.uid;
  const [error, setError] = useState("");
  const [imageUpload, setImageUpload] = useState(null);
  // const [imageList, setImageList] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const markerCollectionRef = collection(
        db,
        "users",
        currentUserId,
        "markers"
      );
      const querySnapshot = await getDocs(markerCollectionRef);
      querySnapshot.forEach((doc) => {
        renderMarkers(doc.data().latitude, doc.data().longitude, doc.id);
      });
    }
    fetchData();
  }, []);

  if (!isLoaded) {
    return "Loading";
  }

  function latLongErrors(lat, long) {
    const latInvalid = lat < -90 || lat > 90;
    const longInvalid = long < -180 || long > 180;
    if (latInvalid && longInvalid) {
      return setError("Invalid latitude and longitude");
    } else if (latInvalid) {
      return setError("Invalid latitude");
    } else if (longInvalid) {
      return setError("Invalid longitude");
    } else {
      setError("");
    }
  }

  async function handleAddMarker(imageUpload) {
    const markerId = uuidv4();
    const markerName = `${markerId}`;
    const markerRef = doc(db, "users", currentUserId, "markers", markerName);
    const imageHashes = collection(db, "users", currentUserId, "imageRefs");
    let imageHash = "";

    await getBase64(imageUpload)
      .then((result) => {
        imageUpload["base64"] = result;
        imageHash = SHA3(result, { outputLength: 160 }).toString();
      })
      .catch((err) => {
        console.log(err);
      });

    checkDuplicateImages(imageHash).then((result) => {
      if (result) {
        return;
      }
      console.log("No duplicates");
      setDoc(doc(imageHashes, imageHash), { exists: true }, { merge: false });

      const imageName = `${currentUserId}/${markerId}-images/${imageHash}`;
      const imageRef = ref(storage, imageName);
      // console.log("imageName: " + imageName);

      /** Uploads the passed image to Firestore under 'uid/markerId-images/', and
       * also uploads a document containing marker information associated with
       * the image to Firebase under 'users/uid/markers/markerId/'.
       */
      uploadBytes(imageRef, imageUpload).then((snapshot) => {
        getDownloadURL(snapshot.ref).then(async (url) => {
          // setImageList((prev) => [...prev, url]);

          const { latitude: lat, longitude: long } = await exifr.gps(url);

          // Marker error handling
          latLongErrors(lat, long);

          let reverseGeoUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
          fetch(reverseGeoUrl)
            .then((response) => response.json())
            .then((data) => {
              let parts = data.results[0].address_components;
              let city = "",
                state = "",
                country = "",
                street = "",
                postal = "";
              parts.forEach((part) => {
                switch (true) {
                  case part.types.includes("country"):
                    country = part.long_name;
                    break;
                  case part.types.includes("administrative_area_level_1"):
                    state += part.long_name;
                    break;
                  case part.types.includes("locality"):
                    city = part.long_name;
                    break;
                  case part.types.includes("street_number"):
                    street += part.long_name;
                    break;
                  case part.types.includes("route"):
                    street += " " + part.long_name;
                    break;
                  case part.types.includes("postal_code"):
                    postal += part.long_name;
                    break;
                }
              });

              exifr.parse(url).then((output) => {
                setDoc(
                  markerRef,
                  {
                    latitude: output.latitude,
                    longitude: output.longitude,
                    street: street,
                    city: city,
                    state: state,
                    country: country,
                    postal: postal,
                    visitTime: output.DateTimeOriginal.toUTCString(),
                    imagesRef: markerName + "-images/",
                  },
                  { merge: false }
                );
                renderMarkers(lat, long, markerId);
              });
            })
            .catch((err) => console.warn("reverse geocoding fetch error"));
        });
      });
    });
  }

  function getBase64(file) {
    return new Promise((resolve) => {
      let fileInfo;
      let baseURL = "";
      // Make new FileReader
      let reader = new FileReader();

      // Convert the file to base64 text
      reader.readAsDataURL(file);

      // on reader load somthing...
      reader.onload = () => {
        // Make a fileInfo Object
        // console.log("Called", reader);
        baseURL = reader.result;
        // console.log(baseURL);
        resolve(baseURL);
      };
      // console.log(fileInfo);
    });
  }

  /** Calls handleAddMarker on each uploaded file upon submitting. */
  function handleSubmit() {
    if (imageUpload.length === 0) return;
    imageUpload.forEach((file) => {
      handleAddMarker(file);
    });
  }

  /** Debug button (remove on production) */
  async function debug() {
    console.log(currentUserId);
    const markerCollectionRef = collection(
      db,
      "users",
      currentUserId,
      "markers"
    );
    const querySnapshot = await getDocs(markerCollectionRef);
    querySnapshot.forEach((doc) => {
      console.log(doc.data().latitude);
    });
  }

  /** Adds a marker to the markers state */
  function renderMarkers(lat, long, id) {
    setMarkers((prevMarkers) => {
      return [
        ...prevMarkers,
        {
          key: id,
          latitude: parseFloat(lat),
          longitude: parseFloat(long),
        },
      ];
    });
  }

  /** Stores an array of uploaded files into the imageUpload state. */
  function handleFiles(event) {
    setImageUpload(null);
    const images = [];
    Array.from(event.target.files).forEach((file) => {
      images.push(file);
      setImageUpload(images);
    });
  }

  async function checkDuplicateImages(imageHash) {
    const docRef = doc(db, "users", currentUserId, "imageRefs", imageHash);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Duplicate image not uploaded");
      return true;
    }
    return false;
  }

  return (
    <Flex
      position="relative"
      flexDirection="column"
      alignItems="center"
      h="100vh"
      w="100vw"
    >
      <Box position="absolute" left={0} top={0} h="100%" w="75%">
        <GoogleMap
          center={center}
          zoom={1}
          options={{
            mapTypeId: "terrain",
            streetViewControl: false,
            mapTypeControl: false,
          }}
          mapContainerStyle={{ width: "100%", height: "100%" }}
        >
          <MarkerList markers={markers} key={uuidv4()} />
        </GoogleMap>
      </Box>

      <Box position="absolute" right={0} top={0} h="100%" w="25%">
        <div>
          <input type="file" multiple onChange={handleFiles} />
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        <button onClick={handleSubmit}>Submit</button>
        <br />
        <button onClick={debug}>Debug</button>
      </Box>
    </Flex>
  );
}

import React, { useEffect, useState, useRef } from "react";
import { Box, Flex, Input } from "@chakra-ui/react";
import { useJsApiLoader, GoogleMap } from "@react-google-maps/api";
import MarkerList from "./MarkerList";
import { v4 as uuidv4 } from "uuid";
import { storage, db, auth, newPostKey } from "../firebase";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, child, push, update } from "firebase/database";
import { Form, Button, Card, Alert } from "react-bootstrap";
import exifr, { gps } from "exifr";

const center = { lat: 48.8584, lng: 2.2945 };

export default function Map() {
  const [markers, setMarkers] = useState([]);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });
  const { currentUser, logout } = useAuth();
  const currentUserId = currentUser.uid;
  const [error, setError] = useState("");

  const [imageUpload, setImageUpload] = useState(null);
  const [imageList, setImageList] = useState([]);

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
        renderMarkers(doc.data().latitude, doc.data().longitude);
      });
    }
    fetchData();
  }, []);

  if (!isLoaded) {
    return "Loading";
  }

  function handleSubmit() {
    if (imageUpload == null) return;
    const markerId = uuidv4();
    const markerName = `${markerId}`;
    const markerRef = doc(db, "users", currentUserId, "markers", markerName);
    const imageName = `${currentUserId}/${markerId}-images/${
      imageUpload.name + uuidv4()
    }`;
    const imageRef = ref(storage, imageName);

    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then(async (url) => {
        setImageList((prev) => [...prev, url]);

        const { latitude: lat, longitude: long } = await exifr.gps(url);
        renderMarkers(lat, long);

        // Creates marker
        if (lat < -90 || lat > 90) {
          setError("Invalid latitude");
        } else {
          setError("");
        }

        if (long < -180 || long > 180) {
          setError("Invalid longitude");
        } else {
          setError("");
        }

        setMarkers((prevMarkers) => {
          return [
            ...prevMarkers,
            {
              key: uuidv4(),
              latitude: parseFloat(lat),
              longitude: parseFloat(long),
            },
          ];
        });

        let reverseGeoUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
        fetch(reverseGeoUrl)
          .then((response) => response.json())
          .then((data) => {
            let parts = data.results[0].address_components;
            let city,
              state,
              country,
              street,
              postal = "";
            parts.forEach((part) => {
              if (part.types.includes("country")) {
                country = part.long_name;
              }
              if (part.types.includes("administrative_area_level_1")) {
                state += part.long_name;
              }
              if (part.types.includes("locality")) {
                city = part.long_name;
              }
              if (part.types.includes("street_number")) {
                street += part.long_name;
              }
              if (part.types.includes("route")) {
                street += " " + part.long_name;
              }
              if (part.types.includes("postal_code")) {
                postal += part.long_name;
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
                  imagesRef: markerName + "/images/",
                },
                { merge: false }
              );
            });
          })
          .catch((err) => console.warn("reverse geocoding fetch error"));
      });
    });
  }

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

  function renderMarkers(lat, long) {
    setMarkers((prevMarkers) => {
      return [
        ...prevMarkers,
        {
          key: uuidv4(),
          latitude: parseFloat(lat),
          longitude: parseFloat(long),
        },
      ];
    });
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
          <MarkerList markers={markers} />
        </GoogleMap>
      </Box>

      <Box position="absolute" right={0} top={0} h="100%" w="25%">
        <div>
          <input
            type="file"
            multiple
            // onChange={(event) => setImageUpload(event.target.files[0])}
            onChange={(event) => {
              setImageUpload(event.target.files[0]);
            }}
          />

          {imageList.map((url) => {
            return <img key={uuidv4()} src={url} id="displayImg" />;
          })}
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        <button onClick={handleSubmit}>Submit</button>
        <br />
        <button onClick={debug}>Debug</button>
      </Box>
    </Flex>
  );
}

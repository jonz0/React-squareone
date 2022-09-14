import React, { useEffect, useState, useRef } from "react";
import { Box, Flex, Input } from "@chakra-ui/react";
import { useJsApiLoader, GoogleMap } from "@react-google-maps/api";
import MarkerList from "./MarkerList";
import { v4 as uuidv4 } from "uuid";
import { storage, db, auth, newPostKey } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, child, push, update } from "firebase/database";
import { Form, Button, Card, Alert } from "react-bootstrap";

const center = { lat: 48.8584, lng: 2.2945 };

export default function Map() {
  const [markers, setMarkers] = useState([]);
  const latRef = useRef();
  const longRef = useRef();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });
  const { currentUser, logout } = useAuth();
  const currentUserId = currentUser.uid;
  const docRef = doc(db, "users", currentUser.uid);
  const [error, setError] = useState("");

  const [imageUpload, setImageUpload] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [age, setAge] = useState();

  if (!isLoaded) {
    return "Loading";
  }

  function handleSubmit() {
    if (imageUpload == null) return;
    const markerId = uuidv4();
    const markerName = `${markerId}`;
    const markerRef = doc(db, "users", currentUserId, "markers", markerName);
    const imageName = `${markerId}/images/${imageUpload.name + uuidv4()}`;
    const imageRef = ref(storage, imageName);

    // Uploads image to firestore
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImageList((prev) => [...prev, url]);
      });
    });

    // Adds marker

    const lat = latRef.current.value;
    const long = longRef.current.value;

    if (lat < -90 || lat > 90) {
      return setError("Invalid Latitude");
    }

    if (long < -180 || long > 180) {
      return setError("Invalid Longitude");
    }

    const uuid = uuidv4();
    setMarkers((prevMarkers) => {
      return [
        ...prevMarkers,
        { key: uuid, latitude: parseFloat(lat), longitude: parseFloat(long) },
      ];
    });

    setDoc(
      markerRef,
      {
        latitude: lat,
        longitude: long,
        city: "",
        country: "",
        visitTime: "2012-04-23T18:25:43.511Z",
        imagesRef: markerName + "/images/",
      },
      { merge: false }
    );
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
            onChange={(event) => setImageUpload(event.target.files[0])}
          />

          {imageList.map((url) => {
            return <img key={uuidv4()} src={url} id="displayImg" />;
          })}
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        Lat: <Input type="text" ref={latRef}></Input>
        Long: <Input type="text" ref={longRef}></Input>
        <button onClick={handleSubmit}>Submit</button>
      </Box>
    </Flex>
  );
}

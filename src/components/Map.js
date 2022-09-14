import React, { useEffect, useState, useRef } from "react";
import { Box, Flex, Input } from "@chakra-ui/react";
import { useJsApiLoader, GoogleMap } from "@react-google-maps/api";
import MarkerList from "./MarkerList";
import { v4 as uuidv4 } from "uuid";
import { storage, db, auth, newPostKey } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
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
  const currentUserId = currentUser.uid + "/";
  const docRef = doc(db, "users", currentUser.uid);
  const [error, setError] = useState("");

  if (!isLoaded) {
    return "Loading";
  }

  function handleAddMarker(event) {
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

    // setDoc(
    //   userRef,
    //   {
    //     firstName: firstNameRef.current.value,
    //     lastName: lastNameRef.current.value,
    //     age: ageRef.current.value,
    //   },
    //   { merge: false }
    // );
  }

  function writeNewPost(uid, username, picture, title, body) {
    // A post entry.
    const postData = {
      author: username,
      uid: uid,
      body: body,
      title: title,
      starCount: 0,
      authorPic: picture,
    };

    // Get a key for a new Post.
    const newPostKey = uuidv4();
    console.log("2");

    // Write the new post's data simultaneously in the posts list and the user's post list.
    const updates = {};

    console.log("3");
    updates["/posts/" + newPostKey] = postData;
    console.log("4");
    updates["/user-posts/" + uid + "/" + newPostKey] = postData;
    return update(ref(db), updates);
  }

  writeNewPost("lool", "jonlu", "jlupic", "jlutitle", "jlubody");

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
        {error && <Alert variant="danger">{error}</Alert>}
        Lat: <Input type="text" ref={latRef}></Input>
        Long: <Input type="text" ref={longRef}></Input>
        <button onClick={handleAddMarker}>Add Marker</button>
      </Box>
    </Flex>
  );
}

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
import exifr from "exifr";
import testimage from "./testimage.jpg";

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
  const [imgUrl, setImgUrl] = useState("");

  if (!isLoaded) {
    return "Loading";
  }

  async function handleSubmit() {
    if (imageUpload == null) return;
    const markerId = uuidv4();
    const markerName = `${markerId}`;
    const markerRef = doc(db, "users", currentUserId, "markers", markerName);
    const imageName = `${currentUserId}/${markerId}-images/${
      imageUpload.name + uuidv4()
    }`;
    const imageRef = ref(storage, imageName);

    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImageList((prev) => [...prev, url]);
      });
    });

    fetch(
      "https://fast-island-93430.herokuapp.com/https://firebasestorage.googleapis.com/v0/b/grand-citadel-359304.appspot.com/o/ollA89QHRVhTD3fiNzdogLeCXnv1%2Fae310790-b0ca-413b-b671-5953bf0c52a6-images%2Ftestimage.jpgfb6831a5-2a60-44a0-8709-0cc232235060?alt=media&token=6c98fad5-98bc-4a04-b317-d390d75c9a83",
      {
        headers: {
          Origin: "googleapis.com",
        },
      }
    )
      .then((res) => res.blob())
      .then((blob) => setImgUrl(URL.createObjectURL(blob)));

    console.log(imgUrl);

    // const { lat, long } = await exifr.gps(
    //   "https://firebasestorage.googleapis.com/v0/b/grand-citadel-359304.appspot.com/o/ollA89QHRVhTD3fiNzdogLeCXnv1%2Fae310790-b0ca-413b-b671-5953bf0c52a6-images%2Ftestimage.jpgfb6831a5-2a60-44a0-8709-0cc232235060?alt=media&token=6c98fad5-98bc-4a04-b317-d390d75c9a83"
    // );

    // console.log({ lat, long });

    // https://fast-island-93430.herokuapp.com/

    // Uploads image to firestore
    // uploadBytes(imageRef, imageUpload).then((snapshot) => {
    //   getDownloadURL(snapshot.ref).then((url) => {
    //     const { lat, long } = exifr.gps(
    //       "https://fast-island-93430.herokuapp.com/" + url
    //     );
    //     // console.log("https://fast-island-93430.herokuapp.com/" + url);
    //     if (lat < -90 || lat > 90) {
    //       return setError("Invalid Latitude");
    //     }

    //     if (long < -180 || long > 180) {
    //       return setError("Invalid Longitude");
    //     }

    //     setImageList((prev) => [...prev, url]);
    //     setMarkers((prevMarkers) => {
    //       return [
    //         ...prevMarkers,
    //         {
    //           key: uuidv4(),
    //           latitude: parseFloat(lat),
    //           longitude: parseFloat(long),
    //         },
    //       ];
    //     });

    //     setDoc(
    //       markerRef,
    //       {
    //         latitude: lat,
    //         longitude: long,
    //         city: "",
    //         country: "",
    //         visitTime: "2012-04-23T18:25:43.511Z",
    //         imagesRef: markerName + "/images/",
    //       },
    //       { merge: false }
    //     );
    //   });
    // });
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
        <button onClick={handleSubmit}>Submit</button>
        {/* <img src="https://fast-island-93430.herokuapp.com/https://firebasestorage.googleapis.com/v0/b/grand-citadel-359304.appspot.com/o/ollA89QHRVhTD3fiNzdogLeCXnv1%2Fae310790-b0ca-413b-b671-5953bf0c52a6-images%2Ftestimage.jpgfb6831a5-2a60-44a0-8709-0cc232235060?alt=media&token=6c98fad5-98bc-4a04-b317-d390d75c9a83"></img> */}
        <img src={imgUrl}></img>
      </Box>
    </Flex>
  );
}

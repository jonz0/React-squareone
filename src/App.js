import React from "react";
import ReactDOM from "react-dom";
import { useRef, useState } from "react";
import {
  ChakraProvider,
  theme,
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  SkeletonText,
  Text,
} from "@chakra-ui/react";
import { FaLocationArrow, FaTimes } from "react-icons/fa";
import {
  useJsApiLoader,
  GoogleMap,
  MarkerF,
  Autocomplete,
  DirectionsRenderer,
  Wrapper,
  Status,
} from "@react-google-maps/api";
import MyMarker from "./MyMarker";
import MarkerList from "./MarkerList";
import { v4 as uuidv4 } from "uuid";

const center = { lat: 48.8584, lng: 2.2945 };

function App() {
  const [markers, setMarkers] = useState([]);
  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const latRef = useRef();
  const longRef = useRef();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  if (!isLoaded) {
    return "Loading";
  }

  function handleAddMarker(event) {
    const lat = latRef.current.value;
    const long = longRef.current.value;
    setMarkers((prevMarkers) => {
      return [
        ...prevMarkers,
        {
          id: uuidv4(),
          latitude: parseFloat(lat),
          longitude: parseFloat(long),
        },
      ];
    });
    console.log(lat, long);
    latRef.current.value = null;
    longRef.current.value = null;
  }

  function handleDisplayMarkers(event) {
    const listItems = markers.map((marker) => {
      return (
        <MarkerF
          key={marker.id}
          position={(parseFloat(marker.lat), parseFloat(marker.long))}
        />
      );
    });

    console.log(listItems.key);
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
          <MarkerF position={center} />
          <MarkerList markers={markers} />
          {/* <MyMarker key={uuidv4()} lat={parseFloat(15)} long={parseFloat(15)} /> */}
        </GoogleMap>
      </Box>

      <Box position="absolute" right={0} top={0} h="100%" w="25%">
        <Input type="text" ref={latRef}></Input>
        <Input type="text" ref={longRef}></Input>
        <button onClick={handleAddMarker}>Add Marker</button>
        <br />
        <button onClick={handleDisplayMarkers}>Display Markers</button>
      </Box>
    </Flex>
  );
}

export default App;

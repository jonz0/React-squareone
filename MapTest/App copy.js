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
let invalidLong = false;
let invalidLat = false;

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

    if (lat < -90 || lat > 90) {
      invalidLat = true;
      latRef.current.value = null;
      longRef.current.value = null;
      return;
    } else {
      invalidLat = false;
    }

    if (long < -180 || long > 180) {
      invalidLong = true;
      latRef.current.value = null;
      longRef.current.value = null;
      return;
    } else {
      invalidLong = false;
    }
    const uuid = uuidv4();
    setMarkers((prevMarkers) => {
      return [
        ...prevMarkers,
        { key: uuid, latitude: parseFloat(lat), longitude: parseFloat(long) },
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
        Lat: <Input type="text" ref={latRef}></Input>
        {invalidLat && <p>Invalid Lat</p>}
        Long: <Input type="text" ref={longRef}></Input>
        {invalidLong && <p>Invalid Long</p>}
        <button onClick={handleAddMarker}>Add Marker</button>
        {invalidLong && <p>lit</p>}
      </Box>
    </Flex>
  );
}

export default App;

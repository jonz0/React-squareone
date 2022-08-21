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
import { useJsApiLoader, GoogleMap } from "@react-google-maps/api";

const center = { lat: 48.8584, lng: 2.2945 };
console.log(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
function App() {
  console.log(process.env);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  if (!isLoaded) {
    return "Loading";
  }

  return (
    <Flex
      position="relative"
      flexDirection="column"
      alignItems="center"
      h="100vh"
      w="100vw"
    >
      <Box position="absolute" left={0} top={0} h="100%" w="100%">
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={{ width: "100%", height: "100%" }}
        ></GoogleMap>
      </Box>
    </Flex>
  );
}

export default App;

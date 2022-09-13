import React, { useEffect, useState } from "react";
import { storage, db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import "../css/Images.css";

export default function Images() {
  const [imageUpload, setImageUpload] = useState(null);
  const [imageList, setImageList] = useState([]);
  const imageListRef = ref(storage, "images/");
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [age, setAge] = useState();
  const { currentUser, logout } = useAuth();

  function uploadImage() {
    if (imageUpload == null) return;
    const imageRef = ref(storage, `images/${imageUpload.name + uuidv4()}`);
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImageList((prev) => [...prev, url]);
      });
    });
  }

  useEffect(() => {
    handleDataDisplay();
    listAll(imageListRef).then((response) => {
      response.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImageList((prev) => [...prev, url]);
        });
      });
    });
  }, []);

  async function handleDataDisplay() {
    const docRef = doc(db, "users", currentUser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setFirstName(docSnap.data().firstName);
      setLastName(docSnap.data().lastName);
      setAge(docSnap.data().age);
    } else {
      console.log("Error: please contact the big boss");
    }
  }

  // const userRef = doc(db, "users", currentUser.uid);
  // setDoc(
  //   userRef,
  //   {
  //     singleImageUrl:
  //   },
  //   { merge: true }
  // );

  return (
    <div>
      <p>User Details:</p>
      <ul>
        <li>
          First name: <span id="user-firstname">{firstName}</span>
        </li>
        <li>
          Last name: <span id="user-lastname">{lastName}</span>
        </li>
        <li>
          Age: <span id="user-age">{age}</span>
        </li>
      </ul>
      <input
        type="file"
        onChange={(event) => setImageUpload(event.target.files[0])}
      />
      <button onClick={uploadImage}>Upload Image</button>

      {imageList.map((url) => {
        return <img key={uuidv4()} src={url} id="displayImg" />;
      })}
    </div>
  );
}

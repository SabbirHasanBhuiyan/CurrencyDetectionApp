import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TextInput, Button,
  StyleSheet, Alert, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { firebase , db ,storage } from '../config';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { collection ,doc , setDoc, addDoc ,onSnapshot} from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';



const EditProfileScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false)
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);

  // Add function to handle picking a photo
  const pickImage = async () => {

    // no permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      // All, Images, Videos
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);

    }
  };
  const uploadMedia = async () => {
    setUploading(true);
    try {
      const { uri } = await FileSystem.getInfoAsync(image);
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          resolve(xhr.response);
        };
        xhr.onerror = (e) => {
          reject(new TypeError('Network request failed'));
        };

        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });
      const filename = image.substring(image.lastIndexOf('/') + 1);

      const StorageRef = ref(filename);
      const upload = uploadBytesResumable(StorageRef, blob); // Use ref to get the child reference
      await upload;
     // await StorageRef.put(blob);
      setUploading(false);
      Alert.alert('Photo Uploaded!!!'); setImage(null);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };
  const getBlobFroUri = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
  
    return blob;
  };
  async function uploadImage(uri, path) {
    let URL;
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage); // Get the storage reference
      const upload = uploadBytesResumable(ref(storageRef, "juieurojoi"), blob); // Use ref to get the child reference
      await upload;
      const downloadURL = await getDownloadURL(ref(storageRef, path)); // Get the download URL after upload
      console.log("File available at", downloadURL);
      setImage("");
    } catch (error) {
      console.error("Error uploading image:", error);
    }
    return;
    try{
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref();
        const upload = storageRef.child(path);
        await upload.put(blob);
        await upload.getDownloadURL().then((url) => {
            URL = url;
        });
        return URL;
    }catch(e){
       throw e;
    }
    return;
    console.log(uri);
    try{
      const response = await fetch(uri);
      const blob = await response.blob();
  
      const storageRef = ref(storage, "Stuff/" + new Date().getTime());
      const uploadTask = uploadBytesResumable(storageRef, blob);
      const imageBlob = await getBlobFroUri(image)

    //  return;
      // listen for events
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          setProgress(progress.toFixed());
        },
        (error) => {
          // handle error
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            console.log("File available at", downloadURL);
            // save record
           // await saveRecord(fileType, downloadURL, new Date().toISOString());
            setImage("");
          });
        }
      );
    }catch(e){
      console.log(e);
    }
  }
  async function saveRecord(fileType, url, createdAt) {
    try {
      const docRef = await addDoc(collection(db, "files"), {
        fileType,
        url,
        createdAt,
      });
      console.log("document saved correctly", docRef.id);
    } catch (e) {
      console.log(e);
    }
  }
/*
  async function uploadImage(uri, fileType) {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(storage, "Stuff/" + new Date().getTime());
    const uploadTask = uploadBytesResumable(storageRef, blob);

    // listen for events
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        setProgress(progress.toFixed());
      },
      (error) => {
        // handle error
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          console.log("File available at", downloadURL);
          // save record
          await saveRecord(fileType, downloadURL, new Date().toISOString());
          setImage("");
          setVideo("");
        });
      }
    );*/
  const checkUsernameAvailability = () => {
    setIsCheckingUsername(true);
    const enteredUsername = name.trim(); // Get the entered username and remove leading/trailing whitespace
    console.log(name);


    firebase.firestore().collection("users").where("userName", "==", name)
    .get()
    .then((snapshot) => {
       /* snapshot.forEach((doc)=>{
          console.log(doc.id, " => ", doc.data());
        })*/
    //    console.log(snapshot)
        setIsCheckingUsername(false);
        if (snapshot.empty) {
          setIsUsernameAvailable(true); // Username is available
        } else {
          setIsUsernameAvailable(false); // Username already exists
        }
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });

  }
  


  useEffect(() => {
    if (!firebase.auth().currentUser.emailVerified) {
      setName('Please verify your email!!')
    } else {
      firebase.firestore().collection('users')
        .doc(firebase.auth().currentUser.uid).get()
        .then((snapshot) => {
          if (snapshot.exists) {
            setUserData(snapshot.data()) // Extracting 'name' property from the snapshot data
          } else {
            console.log('User does not exist')
          }
        })
    }
  }, [emailVerified]);


  useEffect(() => {
    firebase.firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then(snapshot => {
        if (snapshot.exists) {
          const userData = snapshot.data();
          setName(userData.name);
          setAbout(userData.about);
        }
      })
  }, []);
  async function handleUpdate  (){
    await uploadMedia();
    //await uploadImage(image, "images/+new Date().getTime()");
  }


  return (
    <View style={styles.container}>

      <Text style={styles.title}>Edit Profile</Text>

      <TouchableOpacity onPress={pickImage}>
        <Image
          style={styles.image}
          source={{ uri: image ? image : ((userData && userData.profilePic) ? userData.profilePic : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg') }}
        />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={text => {
          setName(text);
          setIsUsernameAvailable(false); // Reset username availability when the user types
         // checkUsernameAvailability();
        }}
        onEndEditing={() => {
          checkUsernameAvailability();
        }}
       // onBlur={checkUsernameAvailability} // Check username availability when the user finishes typing
      />
      {isCheckingUsername && <Text>Checking username availability...</Text>}
      {!isCheckingUsername && isUsernameAvailable && <Text>Username available</Text>}
      {!isCheckingUsername && !isUsernameAvailable && <Text>Username already exists</Text>}

      <TextInput
        style={styles.input}
        placeholder="About"
        value={about}
        onChangeText={text => setAbout(text)}
        multiline
      />

      <Button
        title="Update Profile"
        onPress={handleUpdate}
      />

    </View>
  );
}
export default EditProfileScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 18,
    borderRadius: 6,
    marginBottom: 10
  }
});


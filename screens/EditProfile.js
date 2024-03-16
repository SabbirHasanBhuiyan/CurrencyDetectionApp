import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TextInput, Button,
  StyleSheet, Alert, TouchableOpacity, SafeAreaView, Pressable,Platform
} from 'react-native';
import { firebase, db, storage } from '../config';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { collection, doc, setDoc, addDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import dayjs from 'dayjs';
import DateTimePicker from "@react-native-community/datetimepicker"

const EditProfileScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false)
  const [userData, setUserData] = useState();
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [date, setDate] = useState(new Date()); // Initialize with current date
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [showPicker, setshowPicker] = useState(true);
  let downURL;

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

  const checkUsernameAvailability = () => {
    setIsCheckingUsername(true);
    const enteredUsername = name.trim(); // Get the entered username and remove leading/trailing whitespace

    firebase.firestore().collection("users").where("userName", "==", name)
      .get()
      .then((snapshot) => {
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

  const toggleDatePicker = () => {
    setshowPicker(!showPicker);
  }

  const onChange = (event, selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
    toggleDatePicker(); // Close the date picker
  }

  async function uploadMediaToStorageBucket(uri, fileType) {
    const user = firebase.auth().currentUser;
    if (!user) return;
    console.log(uri);
    const fileName = dayjs().format('YYYY-MM-DD_HH-mm-ss');

    const storageRef = ref(storage, `media/${user.uid}/${fileName}`);

    try {
      const response = await fetch(uri);

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const mediaBlob = await response.blob();
      const upload = uploadBytesResumable(storageRef, mediaBlob);

      return new Promise((resolve, reject) => {
        upload.on(
          'state_changed',
          (snapshot) => {
            console.log(snapshot.bytesTransferred, '/', snapshot.totalBytes);
          },
          (error) => reject(error),
          () => {
            getDownloadURL(upload.snapshot.ref)
              .then((url) => {
                downURL = url
                console.log(downURL);
              }
                //resolve({ fileName, fileUrl: url, ownerId: user.uid, fileType })
              )
              .catch((error) => reject(error));
          }
        );
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async function handleUpdate() {
    await uploadMediaToStorageBucket(image, "image");
    // Handle other updates here
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
        }}
        onEndEditing={() => {
          checkUsernameAvailability();
        }}
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

      <Text style={styles.label}>Date of Birth</Text>

      {showPicker && (
        <DateTimePicker
          mode="date"
          display="spinner"
          value={date}
          onChange={onChange}
        />
      )}

      {!showPicker && (
        <Pressable
          onPress={toggleDatePicker}
        >
          <TextInput
            style={styles.input}
            placeholder="Select Date"
            value={dateOfBirth} // Update this with the chosen date string
            placeholderTextColor="#11182744"
            editable={false}
          />
        </Pressable>
      )}

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

import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TextInput, Button,
  StyleSheet, Alert, TouchableOpacity, SafeAreaView, Pressable, Platform
} from 'react-native';
import { firebase, db, storage } from '../config';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { collection, doc, setDoc, addDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import dayjs from 'dayjs';
import DateTimePicker from "@react-native-community/datetimepicker";

const EditProfileScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false)
  const [userData, setUserData] = useState();
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [date, setDate] = useState(new Date());
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [showPicker, setshowPicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValidPhoneNumber, setIsValidPhoneNumber] = useState(true); // Default to true initially

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const onChange = (event, selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD');
      setDateOfBirth(formattedDate);
      toggleDatePicker(); // Close the date picker
    }
  }

  const toggleDatePicker = () => {
    setshowPicker(!showPicker);
  }

  const validatePhoneNumber = (input) => {
    // Regex pattern to validate Bangladeshi phone number with country code
    const regex = /^(\+?88)?01[0-9]{9}$/;
    return regex.test(input);
  }

  const handlePhoneNumberChange = (input) => {
    setPhoneNumber(input);
    setIsValidPhoneNumber(validatePhoneNumber(input));
  }

  const updateInfoToDB = (url)=>{
    if (url !== "") {
      const user = firebase.auth().currentUser;
      if (user) {
        const userRef = firebase.firestore().collection('users').doc(user.uid);
  
        // Update the userProfilePic field
        userRef.update({
          userProfilePic: url
        })
        .then(() => {
          console.log("User profile picture updated successfully!");
        })
        .catch((error) => {
          console.error("Error updating user profile picture: ", error);
        });
      } else {
        console.error("User not authenticated.");
      }
    }
    if(phoneNumber!=='' && isValidPhoneNumber){
      const user = firebase.auth().currentUser;
      if (user) {
        const userRef = firebase.firestore().collection('users').doc(user.uid);
  
        // Update the userProfilePic field
        userRef.update({
          phoneNumber: phoneNumber
        })
        .then(() => {
          console.log("User profile picture updated successfully!");
        })
        .catch((error) => {
          console.error("Error updating user profile picture: ", error);
        });
      } else {
        console.error("User not authenticated.");
      }     
    }
    if(dateOfBirth){
      const user = firebase.auth().currentUser;
      if (user) {
        const userRef = firebase.firestore().collection('users').doc(user.uid);
  
        // Update the userProfilePic field
        userRef.update({
          birthDay: dateOfBirth
        })
        .then(() => {
          console.log("User profile picture updated successfully!");
        })
        .catch((error) => {
          console.error("Error updating user profile picture: ", error);
        });
      } else {
        console.error("User not authenticated.");
      }    
    }
    navigation.push("Profile");
  }
  

  async function uploadMediaToStorageBucket(uri, fileType) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    setUploading(true); // Set uploading state to true when uploading starts

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
                setUploading(false); // Set uploading state to false when uploading finishes
                updateInfoToDB(url);
              })
              .catch((error) => reject(error));
          }
        );
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async function handleUpdate() {
    if (!isValidPhoneNumber) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid Bangladeshi phone number with country code.');
      return;
    }

    if (image) {
      await uploadMediaToStorageBucket(image, "image");
    }else updateInfoToDB("");
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
        }
      })
  }, []);

  return (
    <View style={styles.container}>

      <TouchableOpacity onPress={pickImage}>
        <Image
          style={styles.image}
          source={{ uri: image ? image : ((userData && userData.profilePic) ? userData.profilePic : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg') }}
        />
      </TouchableOpacity>

      <Text style={styles.label}>Date of Birth</Text>

      {showPicker && (
        <DateTimePicker
          mode="date"
          display="spinner"
          value={date}
          onChange={onChange}
        />
      )}

      <Pressable
        onPress={toggleDatePicker}
      >
        <TextInput
          style={styles.input}
          placeholder="Select Date"
          value={dateOfBirth}
          placeholderTextColor="#11182744"
          editable={false}
        />
      </Pressable>

      <Text style={styles.label}>Phone Number</Text>

      <TextInput
        style={[styles.input, !isValidPhoneNumber && styles.inputError]}
        placeholder="Enter Phone Number"
        value={phoneNumber}
        onChangeText={handlePhoneNumberChange}
        keyboardType="phone-pad"
      />

      {!isValidPhoneNumber && <Text style={styles.errorText}>Please enter a valid Bangladeshi phone number with country code (+88).</Text>}

      {uploading && <Text style={styles.uploadingText}>Uploading image... Please wait</Text>}

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
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  uploadingText: {
    textAlign: 'center',
    color: 'orange',
    marginBottom: 10
  }
});

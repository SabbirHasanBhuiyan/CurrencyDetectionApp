import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TextInput, Button,
  StyleSheet, Alert, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { firebase } from '../config';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';





const EditProfileScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false)
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');

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
      const ref = firebase.storage().ref().child(filename);
      await ref.put(blob);
      setUploading(false);
      Alert.alert('Photo Uploaded!!!'); setImage(null);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };



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

  const handleUpdate = () => {
    // Check if username is unique
    firebase
      .database()
      .ref('usernames/' + name)
      .once('value')
      .then(snapshot => {
        if (snapshot.exists()) {
          Alert.alert('Username already exists');
          return;
        }
        // Proceed with update
        firebase.firestore()
          .collection('users')
          .doc(firebase.auth().currentUser.uid)
          .update({
            name,
            about
          })
          .then(() => {
            Alert.alert('Profile updated!');
            navigation.goBack();
          })
      });
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Edit Profile</Text>

      <TouchableOpacity onPress={pickImage}>
        <Image
          style={styles.image}
          source={{ uri: image ? image : ( (userData && userData.profilePic) ? userData.profilePic : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg') }}
        />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={text => setName(text)}
      />

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

export default EditProfileScreen;

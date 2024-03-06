import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TextInput, Button,
  StyleSheet, Alert, TouchableOpacity
} from 'react-native';
import { firebase } from '../config';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const EditProfileScreen = ({ navigation }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false)
  const [userData, setUserData] = useState(null);
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

  // Add function to handle picking a photo
  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (!response.didCancel) {
        setProfilePic(response.uri);
      }
    })
  }
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');

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
          source={{uri: profilePic ? profilePic : (userData.profilePic? userData.profilePic : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg' )}}
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
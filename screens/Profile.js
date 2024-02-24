import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { firebase } from '../config'

const ProfileScreen = () => {
  const [name, setName] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      firebase.auth().currentUser.reload().then(() => {
        setEmailVerified(firebase.auth().currentUser.emailVerified)
      })
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!firebase.auth().currentUser.emailVerified) {
      setName('Please verify your email!!')
    } else {
      firebase.firestore().collection('users')
        .doc(firebase.auth().currentUser.uid).get()
        .then((snapshot) => {
          if (snapshot.exists) {
            setName(snapshot.data().name) // Extracting 'name' property from the snapshot data
          } else {
            console.log('User does not exist')
          }
        })
    }
  }, [emailVerified]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{name}</Text>
      <TouchableOpacity
        onPress={() => firebase.auth().signOut() }
        style={styles.button}
      >
            <Text style={{fontWeight:'bold',fontSize:22}}> LogOut </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  button: {
    marginTop: 50,
    height: 70,
    width: 250,
    backgroundColor: "#026efd",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
});

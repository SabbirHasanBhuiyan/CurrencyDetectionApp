import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { firebase } from '../config'

const CourseListScreen = () => {
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
            setName(snapshot.data())
          } else {
            console.log('User does not exist')
          }
        })
    }
  }, [emailVerified]);
  if (!emailVerified) {
    let displayName = '';
    if (typeof name === 'object' && name !== null && name.name) {
      displayName = name.name;
    } else {
      displayName = name; // If `name` is not an object
    }
  
    return (
      <View style={styles.container}>
        <Text style={styles.text}>{displayName}</Text>
      </View>
    )
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>CourseListScreen</Text>
    </View>
  );
};

export default CourseListScreen;

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
});

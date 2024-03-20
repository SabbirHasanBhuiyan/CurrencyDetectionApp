import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";

import React, { useEffect, useState } from "react";

import { firebase } from "../config";

const Registration = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);

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
  };

  useEffect(() => {
    // Call the function when name changes
    if (name.trim() !== '') {
      checkUsernameAvailability();
    }else setIsUsernameAvailable(false);
  }, [name]);
  
  registerUser = async (email, password, name) => {
    if (name.trim() !== '') {
      checkUsernameAvailability();
    }else setIsUsernameAvailable(false);
    if(isUsernameAvailable===false) {
      alert('Enter unique user name');
      return;
    }  
  
    await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        firebase
          .auth()
          .currentUser.sendEmailVerification({
            handleCodeInApp: true,
            url: "https://currency-detection-app-4b555.firebaseapp.com",
          })
          .then(() => {
            alert("Verification email sent");
          })
          .catch((error) => {
            alert(error.message);
          })
          .then(() => {
            firebase
              .firestore()
              .collection("users")
              .doc(firebase.auth().currentUser.uid)
              .set({
                userName: name,
                userID: firebase.auth().currentUser.uid,
                userProfilePic: "",
                birthDay: "",
                phoneNumber: "",
              });
          })
          .catch((error) => {
            alert(error.message);
          });
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontWeight: "bold", fontSize: 23 }}>Register Here!!</Text>

      <View style={{ marginTop: 40 }}>
        {/*  <TextInput
          style={styles.textInput}
          placeholder="User Name"
          onChangeText={(name) => setName(name)}
          autoCorrect={false}
        />*/}
        <TextInput
          style={styles.textInput1}
          placeholder="User Name"
          value={name}
          onChangeText={text => {
            setName(text);
            setIsUsernameAvailable(false); // Reset username availability when the user types
          }}
        />
        {isCheckingUsername && (
          <Text style={styles.checkingText}>Checking username availability...</Text>
        )}
        {!isCheckingUsername && isUsernameAvailable && <Text style={styles.availableText}> Username available</Text>}
        {!isCheckingUsername && !isUsernameAvailable && <Text style={styles.notAvailableText}>Username already exists</Text>}

        <TextInput
          style={styles.textInput}
          placeholder="Email"
          onChangeText={(email) => setEmail(email)}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.textInput}
          placeholder="Password"
          onChangeText={(password) => setPassword(password)}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
        />
      </View>
      <TouchableOpacity
        onPress={() => registerUser(email, password, name)}
        style={styles.button}
      >
        <Text style={{ fontWeight: 'bold', fontSize: 22 }}> Register </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Registration;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 100,
  },
  checkingText: {
    textAlign: 'center',
    color: 'orange'
  },
  availableText:{
    textAlign: 'center',
    color: 'green',
  },
  notAvailableText:{
    textAlign: 'center',
    color: 'red',
  },
  textInput1: {
    paddingTop: 20,
    paddingBottom: 10,
    width: 400,
    fontSize: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 0,
    textAlign: "center",
  },
  textInput: {
    paddingTop: 20,
    paddingBottom: 10,
    width: 400,
    fontSize: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 10,
    textAlign: "center",
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

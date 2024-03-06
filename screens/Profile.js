import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';import React, {useState, useEffect, useContext} from 'react';
import { firebase } from '../config'
//import FormButton from '../components/FormButton';
//import firestore from '@react-native-firebase/firestore';

const ProfileScreen = () => {
  const [name, setName] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [userData, setUserData] = useState(null);


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
            setUserData(snapshot.data()) // Extracting 'name' property from the snapshot data
          } else {
            console.log('User does not exist')
          }
        })
    }
  }, [emailVerified]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}}
        showsVerticalScrollIndicator={false}>
        <Image
          style={styles.userImg}
          source={{uri: userData ? userData.userImg || 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg' : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg'}}
        />
        <Text style={styles.userName}>{userData ? userData.fname || 'Test' : 'Test'} {userData ? userData.lname || 'User' : 'User'}</Text>
        {/* <Text>{route.params ? route.params.userId : user.uid}</Text> */}
        <Text style={styles.aboutUser}>
        {userData ? userData.about || 'No details added.' : ''}
        </Text>
        <View style={styles.userBtnWrapper}>
          
              <TouchableOpacity
                style={styles.userBtn}
                onPress={() => {
                  navigation.navigate('EditProfileScreen');
                }}>
                <Text style={styles.userBtnTxt}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.userBtn} onPress={() => firebase.auth().signOut()}>
                <Text style={styles.userBtnTxt}>Logout</Text>
              </TouchableOpacity>
          
        </View>


      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  userImg: {
    height: 150,
    width: 150,
    borderRadius: 75,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  aboutUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  userBtnWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  userBtn: {
    borderColor: '#2e64e5',
    borderWidth: 2,
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  userBtnTxt: {
    color: '#2e64e5',
  },
  userInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  userInfoItem: {
    justifyContent: 'center',
  },
  userInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  userInfoSubTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

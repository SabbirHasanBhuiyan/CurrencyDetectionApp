import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView
} from 'react-native';
import { firebase } from '../config';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const interval = setInterval(() => {
      firebase.auth().currentUser.reload().then(() => {
        setEmailVerified(firebase.auth().currentUser.emailVerified);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!firebase.auth().currentUser.emailVerified) {
      setName('Please verify your email!!');
    } else {
      firebase.firestore().collection('users')
        .doc(firebase.auth().currentUser.uid).get()
        .then((snapshot) => {
          if (snapshot.exists) {
            setUserData(snapshot.data());
          } else {
            console.log('User does not exist');
          }
        });
    }
  }, [emailVerified]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        <Image
          style={styles.userImg}
          source={{ uri: userData ? (userData.userProfilePic || 'https://example.com/default-image.jpg') : 'https://example.com/default-image.jpg' }}
        />
        <Text style={styles.userName}>{userData ?  userData.userName : 'Test User'}</Text>
        <View style={styles.userInfoWrapper}>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>BirthDay</Text>
            <Text style={styles.userInfoSubTitle}>{userData && userData.birthDay ? userData.birthDay : 'Not available'}</Text>
          </View>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>Phone Number</Text>
            <Text style={styles.userInfoSubTitle}>{userData && userData.phoneNumber ? userData.phoneNumber : 'Not available'}</Text>
          </View>

        </View>
        <View style={styles.userBtnWrapper}>
          <TouchableOpacity
            style={styles.userBtn}
            onPress={() => {
              navigation.navigate('EditProfileScreen');
            }}
          >
            <Text style={styles.userBtnTxt}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.userBtn}
            onPress={() => firebase.auth().signOut()}
          >
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
  userInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  userInfoItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  userInfoSubTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginTop: 5,
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
});

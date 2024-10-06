import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button, ScrollView, Picker, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons'; // Assuming you are using Expo for your project
import { firebase } from '../config';
import YouTube from 'react-native-youtube-iframe';

const AboutScreen = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(false); // Add loading state

  const calculateAverageRating = async () => {
    try {
      const totalRatingDoc = await firebase.firestore().collection('ratings').doc('totalRating').get();
      const { total, count } = totalRatingDoc.data();

      const userId = firebase.auth().currentUser.uid;
      const userRatingDoc = await firebase.firestore().collection('ratings').doc(userId).get();
      const userRating = userRatingDoc.exists ? userRatingDoc.data().rating : 0;

      const avgRating = (total ? total : 0) / (count ? count : 0);
      const formattedAvgRating = avgRating.toFixed(2);

      setAverageRating(formattedAvgRating);
      setRating(userRating);
    } catch (error) {
      console.error('Error calculating average rating:', error);
    }
  };

  useEffect(() => {
    calculateAverageRating();
  }, []);

  const handleRating = (rated) => {
    setRating(rated);
  };

  const saveRating = async () => {
    setLoading(true); // Start loading

    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const userId = user.uid;
      const ratingDocRef = firebase.firestore().collection('ratings').doc(userId);
      const ratingDoc = await ratingDocRef.get();

      if (ratingDoc.exists) {
        const previousRatingByTheUser = ratingDoc.data().rating;

        await ratingDocRef.update({
          rating: rating,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });

        const totalRatingDocRef = firebase.firestore().collection('ratings').doc('totalRating');
        const totalRatingDoc = await totalRatingDocRef.get();

        if (totalRatingDoc.exists) {
          const data = totalRatingDoc.data();
          await totalRatingDocRef.update({
            total: data.total - ratingDoc.data().rating + rating,
            count: data.count,
          });
          calculateAverageRating();
        } else {
          await totalRatingDocRef.set({
            total: rating,
            count: 1,
          });
          calculateAverageRating();
        }
      } else {
        await ratingDocRef.set({
          rating: rating,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });

        const totalRatingDocRef = firebase.firestore().collection('ratings').doc('totalRating');
        const totalRatingDoc = await totalRatingDocRef.get();

        if (totalRatingDoc.exists) {
          const data = totalRatingDoc.data();
          await totalRatingDocRef.update({
            total: data.total + rating,
            count: data.count + 1,
          });
          calculateAverageRating();
        } else {
          await totalRatingDocRef.set({
            total: rating,
            count: 1,
          });
          calculateAverageRating();
        }
      }
    } catch (error) {
      console.error('Error saving rating:', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Embedded YouTube Video */}
      <View style={styles.videoContainer}>
        <YouTube videoId="PollTEgYOLw" height={200} width="100%" />
      </View>

      {/* Google Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 22.4716,
            longitude: 91.7877,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={{ latitude: 22.4716, longitude: 91.7877 }} />
        </MapView>
      </View>

      {/* Interactive Real-time Rating */}
      <View style={styles.ratingContainer}>
        <Text>Rate this app:</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((index) => (
            <TouchableOpacity key={index} onPress={() => handleRating(index)}>
              <Ionicons
                name={index <= rating ? 'star' : 'star-outline'}
                size={30}
                color={index <= rating ? 'gold' : 'gray'}
                style={styles.starIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => saveRating(rating)}
          disabled={loading} // Disable button when loading
        >
          {loading ? (
            <ActivityIndicator color="white" /> // Show loading spinner
          ) : (
            <Text style={styles.submitButtonText } >Submit Rating</Text> // Show button text
          )}
        </TouchableOpacity>
        <Text style={styles.averageRatingText}>Average Rating: {averageRating}</Text>
      </View>

      {/* Info About Developer */}
      <View style={styles.infoContainer}>
        <Text>About the Developer:</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  videoContainer: {
    marginBottom: 20,
  },
  video: {
    height: 200,
    paddingHorizontal: 0,
  },
  mapContainer: {
    marginVertical: 20,
    height: 200,
  },
  map: {
    flex: 1,
  },
  ratingContainer: {
    marginVertical: 20,
  },
  formContainer: {
    marginVertical: 20,
  },
  input: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  picker: {
    marginBottom: 10,
  },
  infoContainer: {
    marginVertical: 20,
  },
  ratingContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row', // Align stars horizontally
    justifyContent: 'center',
    marginVertical: 10,
  },
  starIcon: {
    marginRight: 5, // Add some space between stars
  },
  submitButton: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});


export default AboutScreen;

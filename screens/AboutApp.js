import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button, ScrollView, Picker, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons'; // Assuming you are using Expo for your project
import { firebase } from '../config';
import YouTube from 'react-native-youtube-iframe';



const AboutScreen = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [needToFetchRaing, setNeedToFetchRating] = useState(0);

  const calculateAverageRating = async () => {
    try {
      // Retrieve the total rating and count from the 'totalRating' document
      const totalRatingDoc = await firebase.firestore().collection('ratings').doc('totalRating').get();
      const { total, count } = totalRatingDoc.data();

      // Retrieve the current user's rating
      const userId = firebase.auth().currentUser.uid;
      const userRatingDoc = await firebase.firestore().collection('ratings').doc(userId).get();
      const userRating = userRatingDoc.exists ? userRatingDoc.data().rating : 0;

      // Calculate the average rating
      const avgRating = (total?total:0) / (count?count:0);
      // Format the average rating to display it with two decimal places
      const formattedAvgRating = avgRating.toFixed(2);

      // Update the state with the average rating and user's previous rating
      setAverageRating(formattedAvgRating);
      setRating(userRating);
    } catch (error) {
      console.error('Error calculating average rating:', error);
    }
  };

  useEffect(() => {
    // Function to calculate and update the average rating
 
    // Call the function to calculate the average rating
    calculateAverageRating();
  }, []);


  const handleRating = (rated) => {
    // Set the selected rating
    setRating(rated);

    // Implement logic to store user rating (if needed)
    // For example, you can call a function to store rating in Firebase here
    // storeUserRating(rated);
  };

  const saveRating = async () => {
    // Check if the user is authenticated
    const user = firebase.auth().currentUser;
    if (!user) {
      console.log('User is not authenticated.');
      return;
    }

    // Get the user's ID
    const userId = user.uid;

    // Check if the user has previously rated the app
    const ratingDocRef = firebase.firestore().collection('ratings').doc(userId);
    const ratingDoc = await ratingDocRef.get();

    if (ratingDoc.exists) {
      // User has previously rated the app, update the rating
      const previousRatingByTheUSer = ratingDoc.data().rating;

      await ratingDocRef.update({
        rating: rating,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });

      const totalRatingDocRef = firebase.firestore().collection('ratings').doc('totalRating');
      const totalRatingDoc = await totalRatingDocRef.get();
      if (totalRatingDoc.exists) {
        // Total rating document exists, update the total rating
        const data = totalRatingDoc.data();
        await totalRatingDocRef.update({
          total: data.total - ratingDoc.data().rating + rating,
          count: data.count
        });
        calculateAverageRating();
      } else {
        await totalRatingDocRef.set({
          total: rating,
          count: 1
        }).then(()=>{
          calculateAverageRating();
        })
       
      }
    } else {
      // User is rating the app for the first time, create a new rating document
      await ratingDocRef.set({
        rating: rating,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      const totalRatingDocRef = firebase.firestore().collection('ratings').doc('totalRating');
      const totalRatingDoc = await totalRatingDocRef.get();
      if (totalRatingDoc.exists) {
        // Total rating document exists, update the total rating
        const data = totalRatingDoc.data();
        await totalRatingDocRef.update({
          total: data.total + rating,
          count: data.count + 1
        }).then(()=>{
          calculateAverageRating();
        })

      } else {
        await totalRatingDocRef.set({
          total: rating,
          count: 1
        }).then(()=>{
          calculateAverageRating();
        })

      }
    }


    // Update total rating
    /*  const totalRatingDocRef = firebase.firestore().collection('ratings').doc('totalRating');
      const totalRatingDoc = await totalRatingDocRef.get();
      if (totalRatingDoc.exists) {
        // Total rating document exists, update the total rating
        const data = totalRatingDoc.data();
        await totalRatingDocRef.set({
          total: data.total + rating,
          count: data.count + 1
        });
      } else {
        // Total rating document doesn't exist, create a new one
        await totalRatingDocRef.set({
          total: rating,
          count: 1
        });
      }
    };*/
  }


  const handleComment = () => {
    // Implement logic to store user comment
    console.log('Comment:', comment);
  };

  const handleOptionChange = (value) => {
    // Implement logic to handle dropdown selection
    setSelectedOption(value);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Embedded YouTube Video */}
      <View style={styles.videoContainer}>
        <YouTube
          videoId="PollTEgYOLw"
          height={200}
          width="100%"
        />
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
        <TouchableOpacity style={styles.submitButton} onPress={() => saveRating(rating)}>
          <Text style={styles.submitButtonText}>Submit Rating</Text>
        </TouchableOpacity>
        <Text style={styles.averageRatingText}>Average Rating: {averageRating}</Text>

      </View>


      {/* Multiple Text Boxes and Drop Down Lists */}
      {/*}    <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your comment"
          value={comment}
          onChangeText={setComment}
        />
        <Picker
          selectedValue={selectedOption}
          onValueChange={(itemValue) => handleOptionChange(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Option 1" value="option1" />
          <Picker.Item label="Option 2" value="option2" />
          <Picker.Item label="Option 3" value="option3" />
        </Picker>
        <Button title="Submit Comment" onPress={handleComment} />
      </View> */}

      {/* Info About Developer */}
      <View style={styles.infoContainer}>
        <Text>About the Developer:</Text>
        {/* Add developer information here */}
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
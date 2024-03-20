import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Button, ScrollView, Picker } from 'react-native';
import { WebView } from 'react-native-webview';
import MapView, { Marker } from 'react-native-maps';
import { firebase } from '../config';

const AboutScreen = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  const handleRating = () => {
    // Implement logic to store user rating
    console.log('Rating:', rating);
  };

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
        <WebView
          style={styles.video}
          source={{ uri: 'https://www.youtube.com/embed/YOUR_VIDEO_ID' }} // Replace YOUR_VIDEO_ID with actual video ID
        />
      </View>

      {/* Google Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker coordinate={{ latitude: 37.78825, longitude: -122.4324 }} />
        </MapView>
      </View>

      {/* Interactive Real-time Rating */}
      <View style={styles.ratingContainer}>
        <Text>Rate this app:</Text>
        {/* Render stars for rating */}
        {[1, 2, 3, 4, 5].map((star) => (
          <Button key={star} title={star.toString()} onPress={() => setRating(star)} />
        ))}
        <Button title="Submit Rating" onPress={handleRating} />
      </View>

      {/* Multiple Text Boxes and Drop Down Lists */}
      <View style={styles.formContainer}>
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
      </View>

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
    marginVertical: 20,
  },
  video: {
    height: 200,
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
});

export default AboutScreen;

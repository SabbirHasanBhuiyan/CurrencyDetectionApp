
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { bundleResourceIO, decodeJpeg } from "@tensorflow/tfjs-react-native";
import * as tf from "@tensorflow/tfjs";
import * as FileSystem from "expo-file-system";

const modelJson = require("../assets/trained_model/model.json");
const modelWeights = require("../assets/trained_model/weights.bin");

const datasetClasses = ["50", "20", "100"];

const transformImageToTensor = async (uri) => {
  const img64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  const imgBuffer = tf.util.encodeString(img64, "base64").buffer;
  const raw = new Uint8Array(imgBuffer);
  let imgTensor = decodeJpeg(raw);
  const scalar = tf.scalar(255);
  imgTensor = tf.image.resizeNearestNeighbor(imgTensor, [224, 224]);
  const tensorScaled = imgTensor.div(scalar);
  const img = tf.reshape(tensorScaled, [1, 224, 224, 3]);
  return img;
};

const DetectScreen = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState();

  useEffect(() => {
    (async () => {
      tf.setBackend('rn-webgl'); // Set the backend to 'rn-webgl'
      const model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
      setModel(model);
    })();
  }, []);

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaPermissionStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status === "granted" && mediaPermissionStatus === "granted") {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.3,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setLoading(true);
            await tf.ready();
            const model = await tf.loadLayersModel(
                bundleResourceIO(modelJson, modelWeights)
            );
            setModel(model);

            const imageTensor = await transformImageToTensor(result.assets[0].uri);
            const predictions = model.predict(imageTensor);
            const highestPredictionIndex = predictions.argMax(1).dataSync();
            console.log(highestPredictionIndex);
            const predictedClass = `${datasetClasses[highestPredictionIndex]}`;
            setPrediction(predictedClass);
            setLoading(false);
        }
    } else {
        alert("Camera permission not granted");
    }
};

const pickImageFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.3,
    });

    if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setLoading(true);
        await tf.ready();
        const model = await tf.loadLayersModel(
            bundleResourceIO(modelJson, modelWeights)
        );
        setModel(model);

        const imageTensor = await transformImageToTensor(result.assets[0].uri);
        const predictions = model.predict(imageTensor);
        const highestPredictionIndex = predictions.argMax(1).dataSync();
        const predictedClass = `${datasetClasses[highestPredictionIndex]}`;
        setPrediction(predictedClass);
        setLoading(false);
    }
};



  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={takePicture}>
        <Text style={styles.buttonText}>Take Picture</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={pickImageFromGallery}>
        <Text style={styles.buttonText}>Pick Image from Gallery</Text>
      </TouchableOpacity>
      {selectedImage && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.image} />
          <Text style={styles.predictionText}>Detected Expression: {loading ? <ActivityIndicator size="small" color="#0000ff" /> : prediction}</Text>
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4267B2',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  predictionText: {
    fontWeight: 'bold',
  },
});


export default DetectScreen;
import React, { useState, useEffect } from "react";
import { LogBox } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Ionicons from "@expo/vector-icons/Ionicons";

import { firebase } from "./config"; // Adjust your import path accordingly
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import Header from "./components/Header";
import CountryInfo from './screens/CountryInfo';
import Blogs from "./screens/Blogs";
import AboutScreen from "./screens/AboutApp";
import ProfileScreen from "./screens/Profile";
import Login from "./screens/Login";
import Registration from "./screens/Registration";
import EditProfileScreen from "./screens/EditProfile";
import DetectScreen from "./screens/Detect";
import BarChartDemo from './screens/BarChartDemo';
import RateAndInfo from './screens/RateAndInfo';
import CurrencyRates from "./screens/CurrencyRates";

// Ignore specific warnings
LogBox.ignoreLogs(['Warning: ...', 'Some other warning']);
// Alternatively, ignore all logs
LogBox.ignoreAllLogs();

const client = new ApolloClient({
  uri: 'https://countries.trevorblades.com/graphql',
  cache: new InMemoryCache(),
});

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Define a stack navigator for DetectScreen and BarChartDemo
function DetectStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Detect"
        component={DetectScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BarChartDemo"
        component={BarChartDemo}
        options={({ navigation }) => ({
          title: "Currency Detection Report",
          headerLeft: () => (
            <Ionicons 
              name="arrow-back" 
              size={24} 
              style={{ marginLeft: 10 }}
              onPress={() => navigation.goBack()}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
}

// Define a stack navigator for Profile and EditProfileScreen
function ProfileStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
      />
    </Stack.Navigator>
  );
}

function CurrencyInfokNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Exchange Rates with dollar"
        component={RateAndInfo}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CurrencyRate"
        component={CurrencyRates}
      />
      <Stack.Screen
        name="CountryInfo"
        component={CountryInfo}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // Unsubscribe on unmount
  }, []);

  if (initializing) return null; // Optionally return a loading indicator here

  if (!user) {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              headerTitle: () => <Header name="Your Currency" />,
              headerStyle: {
                height: 150,
                borderBottomLeftRadius: 50,
                borderBottomRightRadius: 50,
                backgroundColor: "#00e4d0",
                shadowColor: "#000",
                elevation: 25,
              },
            }}
          />
          <Stack.Screen
            name="Registration"
            component={Registration}
            options={{
              headerTitle: () => <Header name="Your Currency" />,
              headerStyle: {
                height: 150,
                borderBottomLeftRadius: 50,
                borderBottomRightRadius: 50,
                backgroundColor: "#00e4d0",
                shadowColor: "#000",
                elevation: 25,
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <ApolloProvider client={client}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarLabelPosition: "below-icon",
            tabBarActiveTintColor: "purple",
          }}
        >
          <Tab.Screen 
            name="Detect" 
            component={DetectStackNavigator}  
            options={{
              tabBarLabel: "Detect",
              tabBarIcon: () => <Ionicons name={"scan-circle-outline"} size={20} />,
            }}
          />
          <Tab.Screen 
            name="Currency Info" 
            component={CurrencyInfokNavigator} 
            options={{
              tabBarLabel: "Currency Info",
              tabBarIcon: () => <Ionicons name={"analytics-outline"} size={20} />,
            }}
          />
          <Tab.Screen 
            name="Blogs" 
            component={Blogs} 
            options={{
              tabBarLabel: "Blogs",
              tabBarIcon: () => <Ionicons name={"newspaper-outline"} size={20} />,
            }}
          />
          <Tab.Screen
            name="ProfileStack"
            component={ProfileStackNavigator}
            options={{
              tabBarLabel: "My Profile",
              tabBarIcon: () => <Ionicons name={"person"} size={20} />,
            }}
          />
          <Tab.Screen 
            name="AboutApp"
            component={AboutScreen} 
            options={{
              tabBarLabel: "About App",
              tabBarIcon: () => <Ionicons name="information-circle-outline" size={20} />
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
}

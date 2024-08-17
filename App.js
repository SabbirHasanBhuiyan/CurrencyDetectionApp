import { LogBox } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState, useEffect } from "react";
import 'react-native-gesture-handler';

import Blogs from "./screens/Blogs";
import AboutScreen from "./screens/AboutApp";
import ProfileScreen from "./screens/Profile";
import Login from "./screens/Login";
import Registration from "./screens/Registration";
import EditProfileScreen from "./screens/EditProfile";
import DetectScreen from "./screens/Detect";
import BarChartDemo from './screens/BarChartDemo';
import CurrencyRates from "./screens/CurrencyRates";
import { firebase } from "./config";
import Header from "./components/Header";

// Ignore specific warnings
LogBox.ignoreLogs(['Warning: ...', 'Some other warning']);
// Alternatively, ignore all logs
LogBox.ignoreAllLogs();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Define a stack navigator for DetectScreen and BarChartDemo
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
          title: "Currency Detection Report",  // Title for the BarChartDemo screen
          headerLeft: () => (
            <Ionicons 
              name="arrow-back" 
              size={24} 
              style={{ marginLeft: 10 }}
              onPress={() => navigation.goBack()}  // Navigate back to the Detect screen
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
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
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
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarLabelPosition: "below-icon",
          tabBarActiveTintColor: "purple",
        }}
      >
        <Tab.Screen 
          name="Detect" 
          component={DetectStackNavigator}  // Use the stack navigator for Detect
          options={{
            tabBarLabel: "Detect",
            tabBarIcon: () => <Ionicons name={"scan-circle-outline"} size={20} />,
          }}
        />
        <Tab.Screen 
          name="CurrencyRates" 
          component={CurrencyRates} 
          options={{
            tabBarLabel: "Currency Rates",
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
          component={ProfileStackNavigator}  // Use the stack navigator for Profile
          options={{
            tabBarLabel: "My Profile",
            tabBarIcon: () => <Ionicons name={"person"} size={20} />,
            tabBarBadge: 3,
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
  );
}

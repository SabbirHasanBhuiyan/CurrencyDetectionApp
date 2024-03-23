import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Blogs from "./screens/Blogs";
import CourseListScreen from "./screens/AboutApp";
import ProfileScreen from "./screens/Profile";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AboutStack } from "./AppStack";
import 'react-native-gesture-handler';//
import { firebase } from "./config";
import Header from "./components/Header";
import Login from "./screens/Login";
import Registration from "./screens/Registration";
import EditProfileScreen from "./screens/EditProfile";
import React, { useState , useEffect} from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DetectScreen from "./screens/Detect";


import 'react-native-gesture-handler';

const Stack = createStackNavigator();

const Tab = createBottomTabNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  // Handle user state changes

  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }
  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);

    return subscriber;
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
   /* if(!user){

    }*/
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          //   tabBarShowLabel: false,
          tabBarLabelPosition: "below-icon",
          tabBarActiveTintColor: "purple",
        }}
      >
        <Tab.Screen 
          name="Detect" 
          component={DetectScreen} 
          options={{
            tabBarLabel: "Detect",
            tabBarIcon: () => <Ionicons name={"scan-circle-outline"} size={20} />,
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
            tabBarBadge: 3,
          }}
        />
       { /*<Tab.Screen
          name="EditProfileScreen"
          component={EditProfileScreen}
          options={{
            tabBarLabel: "My Profile",
            tabBarIcon: () => <Ionicons name={"person"} size={20} />,
            tabBarBadge: 3,
          }}
        />*/}

        <Tab.Screen name="About App" component={CourseListScreen} />

      {/*  <Tab.Screen  
          name="AboutScreen" 
          component={AboutScreen} 
          options={{
            tabBarLabel: "About App",
            tabBarIcon: () => <Ionicons name={"newspaper-outline"} size={20} />,
          }}
        />
        <Tab.Screen
          name="About Stack"
          component={AboutStack}
          options={{
            tabBarLabel: "About App",
            tabBarIcon: () => <Ionicons name={"newspaper-outline"} size={20} />,
          }}
        />*/}
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function ProfileStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
      />
    </Stack.Navigator>
  );
}
import { Alert, StyleSheet, TouchableHighlight } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/components/useColorScheme.web";

import { setSSO } from "@/components/handleSSO";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";

const colorScheme = useColorScheme();

GoogleSignin.configure({
  webClientId:
    "41152084372-m0tl5v67e37n641spmn6r1m4igotq477.apps.googleusercontent.com",
  scopes: [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.force-ssl",
  ],
  offlineAccess: true,
  forceCodeForRefreshToken: false,
  iosClientId:
    "41152084372-s8irbbajcj8s1ni2qteos0t1istur6k0.apps.googleusercontent.com",
});

const handleGoogleSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (isSuccessResponse(response)) {
      if (response.data.idToken != null) {
        setSSO("ytm", response.data.idToken);
      }
    } else {
      // sign in was cancelled
    }
  } catch (error) {
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          Alert.alert("Play services not available or severely out of date");
          break;
        default:
          Alert.alert("Something else has happened");
          break;
      }
    } else {
      Alert.alert("Non Google Signin related issue has occurred");
    }
  }
};

export default function authpage() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome to Musicli</Text>
          <Text style={styles.subtitle}>Link an Account</Text>
        </View>

        {/* Spotify button */}
        <TouchableHighlight
          onPress={() => setSSO("userPrefferedMusicPlatform", "Spotify")}
          style={styles.touchable}
          underlayColor={"white"}
        >
          <Text style={styles.text}>Spotify</Text>
        </TouchableHighlight>

        {/* YTM button */}
        <TouchableHighlight
          onPress={() => handleGoogleSignIn()}
          style={styles.touchable}
        >
          <Text style={styles.text}>YouTube Music</Text>
        </TouchableHighlight>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorScheme === "dark" ? "rgba(255,255,255,0.1)" : "#eee",
    flex: 1,
  },
  header: {
    alignItems: "center",
    margin: 30,
    backgroundColor: "rgba(0,0,0,0)",
  },
  welcome: {
    fontSize: 30,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 20,
  },
  touchable: {
    margin: 20,
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#ddd",
  },
  text: {
    fontSize: 30,
  },
});

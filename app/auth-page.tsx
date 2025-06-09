import { StyleSheet, TouchableHighlight } from "react-native";
import { Text, View } from "@/components/Themed";
import { Alert, Button } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/components/useColorScheme.web";

const colorScheme = useColorScheme();

export default function AuthPage() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome to Musicli</Text>
          <Text style={styles.subtitle}>Link an Account</Text>
        </View>
        <TouchableHighlight
          onPress={() => Alert.alert("Spotify Auth")}
          style={styles.touchable}
          underlayColor={"white"}
        >
          <Text style={styles.text}>Spotify</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() => Alert.alert("Apple Music Auth")}
          style={styles.touchable}
        >
          <Text style={styles.text}>Apple Music</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() => Alert.alert("YouTube Music Auth")}
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

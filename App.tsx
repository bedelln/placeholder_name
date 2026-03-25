import { useState } from "react";
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// Replace YOUR_LOCAL_IP with your computer's local network IP, for example:
// const API_BASE_URL = "http://192.168.1.25:4000";
// Do not use localhost here. On a phone or emulator, localhost points to that device,
// not to the computer where your backend server is running.
const API_BASE_URL = "http://localhost:4000";

export default function App() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [responseText, setResponseText] = useState("Responses will appear here.");
  const [loading, setLoading] = useState(false);

  const formatResponse = (title: string, data: unknown) => {
    return `${title}\n\n${JSON.stringify(data, null, 2)}`;
  };

  const handleRegister = async () => {
    setLoading(true);
    setResponseText("Registering...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Register request failed");
      }

      setResponseText(formatResponse("Register success", data));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setResponseText(`Register error\n\n${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setResponseText("Logging in...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login request failed");
      }

      setResponseText(formatResponse("Login success", data));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setResponseText(`Login error\n\n${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>SideQuesters Demo</Text>

        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username (register only)"
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          autoCapitalize="none"
          secureTextEntry
          style={styles.input}
        />

        <View style={styles.button}>
          <Button title="Register" onPress={handleRegister} disabled={loading} />
        </View>

        <View style={styles.button}>
          <Button title="Login" onPress={handleLogin} disabled={loading} />
        </View>

        {loading ? <ActivityIndicator size="small" /> : null}

        <Text style={styles.responseLabel}>Response</Text>
        <Text selectable style={styles.responseBox}>
          {responseText}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 4,
  },
  button: {
    marginTop: 4,
  },
  responseLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
  },
  responseBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    minHeight: 180,
  },
});

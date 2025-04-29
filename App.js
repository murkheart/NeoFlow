import React, { useState, useEffect, useRef } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Animated,
  Image,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from 'react-native-safe-area-context';

const Drawer = createDrawerNavigator();

const initialBackground = require("./assets/loadingbgui.png");
const newBackground = require("./assets/bgfinalui.png");
const initialLogo = require("./assets/LogoOnlyFinalUI.png");
const newLogo = require("./assets/LogoOnly.png");

// Dummy logos for the tools
const srfsLogo = require("./assets/srfsLogo.png");
const gwLogo = require("./assets/gwLogo.png");
const eorLogo = require("./assets/eorLogo.png");

function HomeScreen({ navigation, setHeaderImage }) {
  const [background, setBackground] = useState(initialBackground);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const fadeLoop = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      // Reset values every time screen is focused
      setBackground(initialBackground);
      fadeAnim.setValue(1);
      setButtonsVisible(false);
      setHeaderImage(initialLogo);

      // Start fade animation loop
      fadeLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      fadeLoop.current.start();

      const timer = setTimeout(() => {
        fadeLoop.current.stop();
        fadeAnim.setValue(1);
        setBackground(newBackground);
        setButtonsVisible(true);
        setHeaderImage(newLogo);
      }, 5000);

      return () => {
        clearTimeout(timer);
        fadeLoop.current?.stop();
      };
    }, [])
  );

  return (
    <ImageBackground source={background} style={styles.fullScreenBackground}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {buttonsVisible && (
          <View style={styles.buttonRowContainer}>
            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => navigation.navigate("Smart Fluid Rheology Simulator")}
            >
              <Text style={styles.buttonText}>Smart Fluid Rheology Simulator</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => navigation.navigate("Geothermal Well Optimization Tool")}
            >
              <Text style={styles.buttonText}>Geothermal Well Optimization Tool</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => navigation.navigate("Enhanced Oil Recovery Planner")}
            >
              <Text style={styles.buttonText}>Enhanced Oil Recovery Planner</Text>
            </TouchableOpacity>
          </View>
        )}
        <StatusBar style="auto" />
      </Animated.View>
    </ImageBackground>
  );
}

function ToolScreen({ route, navigation }) {
  const { setHeaderImage } = route.params;
  const screenName = route.name;

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedOption, setSelectedOption] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [inputValues, setInputValues] = useState({});
  const [calculatedResult, setCalculatedResult] = useState(null);

  const toolAssets = {
    "Smart Fluid Rheology Simulator": {
      loadingBg: require("./assets/SRFSBG.png"),
      finalBg: require("./assets/sfrsnew.png"),
      loadingLogo: require("./assets/srfsloadinglogo.png"),
      finalLogo: require("./assets/srfsLogo.png"),
    },
    "Geothermal Well Optimization Tool": {
      loadingBg: require("./assets/GWBG.png"),
      finalBg: require("./assets/gwnew.png"),
      loadingLogo: require("./assets/gwloadinglogo.png"),
      finalLogo: require("./assets/gwLogo.png"),
    },
    "Enhanced Oil Recovery Planner": {
      loadingBg: require("./assets/EORBG.png"),
      finalBg: require("./assets/eornew.png"),
      loadingLogo: require("./assets/eorloadinglogo.png"),
      finalLogo: require("./assets/eorLogo.png"),
    },
  };

  const assets = toolAssets[screenName];

  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(true);
      setBackgroundImage(assets.loadingBg);
      setHeaderImage(assets.loadingLogo);

      const fadeLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      fadeLoop.start();

      const timer = setTimeout(() => {
        fadeLoop.stop();
        fadeAnim.setValue(1);
        setBackgroundImage(assets.finalBg);
        setHeaderImage(assets.finalLogo);
        setIsLoading(false);
      }, 5000);

      return () => {
        clearTimeout(timer);
        fadeLoop.stop();
      };
    }, [screenName])
  );

  // --- EOR FORMULAS ---
  const calculateResult = (values) => {
    if (selectedOption === "Oil Recovery Factor: Polymer Flooding Efficiency") {
      const inoilsat = parseFloat(values.inoilsat || 0);
      const residoil = parseFloat(values.residoil || 1); // avoid division by zero
      return ((inoilsat - residoil)/ residoil) * 100;
    }
    if (selectedOption === "Oil Recovery Factor: Fractional Flow Theory") {
      const watvis = parseFloat(values.watvis || 0);
      const oilvis = parseFloat(values.oilvis || 1); // avoid division by zero
      return (1-(watvis / oilvis)) * 100;
    }
    if (selectedOption === "Optimal Polymer Concentration: Modified Power Law Model") {
      const k = parseFloat(values.k || 1);
      const n = parseFloat(values.n || 1);
      const Cp = parseFloat(values.Cp || 1);
      return (k * (Cp^n)) ;
    }
    if (selectedOption === "Optimal Polymer Concentration: Empirical Optimization Equation") {
      const oilvis = parseFloat(values.oilvis || 1);
      const watvis = parseFloat(values.watvis || 1);
      const K1 = parseFloat(values.K1 || 1);
      const K2 = parseFloat(values.K2 || 1);
      return (K1 / ((oilvis / watvis)^K2)) ;
    }
    if (selectedOption === "Water Cut Reduction") {
      const Mpolymer = parseFloat(values.Mpolymer || 0);
      const Mwater = parseFloat(values.Mwater || 0);
      return (1-(Mpolymer / Mwater)) * 100;
    }
    return null;
  };

  const handleInputChange = (field, value) => {
    const updatedValues = { ...inputValues, [field]: value };
    setInputValues(updatedValues);
    const result = calculateResult(updatedValues);
    setCalculatedResult(result);
  };

  if (screenName === "Enhanced Oil Recovery Planner" && !isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ImageBackground source={backgroundImage} style={styles.fullScreenBackground}>
          <View style={styles.eorContainer}>
            {/* Dropdown */}
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setDropdownVisible(!dropdownVisible)}
            >
              <Text style={styles.dropdownText}>
                {selectedOption || "Select Calculation ▼"}
              </Text>
            </TouchableOpacity>
            {dropdownVisible && (
              <View style={styles.dropdownOptions}>
                {["Oil Recovery Factor: Polymer Flooding Efficiency", "Oil Recovery Factor: Fractional Flow Theory", "Optimal Polymer Concentration: Modified Power Law Model", "Optimal Polymer Concentration: Empirical Optimization Equation", "Water Cut Reduction"].map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionButton}
                    onPress={() => {
                      setSelectedOption(option);
                      setInputValues({});
                      setCalculatedResult(null);
                      setDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Input Table */}
            {selectedOption && (
              <View style={{ width: "100%", marginTop: 20 }}>
                {selectedOption === "Oil Recovery Factor: Polymer Flooding Efficiency" && (
                  <>
                    <InputField label="Initial Oil Saturation (fraction)" field="inoilsat" onChange={handleInputChange} />
                    <InputField label="Residual Oil Saturation after flooding (fraction)" field="residoil" onChange={handleInputChange} />
                  </>
                )}
                {selectedOption === "Oil Recovery Factor: Fractional Flow Theory" && (
                  <>
                    <InputField label="Water Viscosity (cP)" field="watvis" onChange={handleInputChange} />
                    <InputField label="Oil Viscosity (cP)" field="oilvis" onChange={handleInputChange} />
                  </>
                )}
                {selectedOption === "Optimal Polymer Concentration: Modified Power Law Model" && (
                  <>
                    <InputField label="Empirical Constant" field="k" onChange={handleInputChange} />
                    <InputField label="Flow Behavior Index" field="n" onChange={handleInputChange} />
                    <InputField label="Specific Heat Capacity" field="Cp" onChange={handleInputChange} />
                  </>
                )}
                {selectedOption === "Optimal Polymer Concentration: Empirical Optimization Equation" && (
                  <>
                    <InputField label="Oil Viscosity (cP)" field="oilvis" onChange={handleInputChange} />
                    <InputField label="Water Viscosity (cP)" field="watvis" onChange={handleInputChange} />
                    <InputField label="Reservoir-Specific Empirical Constant One" field="K1" onChange={handleInputChange} />
                    <InputField label="Reservoir-Specific Empirical Constant Two" field="K2" onChange={handleInputChange} />
                  </>
                )}
                {selectedOption === "Water Cut Reduction" && (
                  <>
                    <InputField label="Mobility Ratio with Polymer" field="Mpolymer" onChange={handleInputChange} />
                    <InputField label="Mobility Ratio before Polymer Injection" field="Mwater" onChange={handleInputChange} />
                  </>
                )}
              </View>
            )}

            {/* Buttons */}
            <View style={styles.eorButtonContainer}>
              <TouchableOpacity
                style={styles.eorButton}
                onPress={() =>
                  navigation.navigate("ResultScreen", {
                    selectedOption,
                    inputValues,
                    calculatedResult,
                  })
                }
              >
                <Text style={styles.eorButtonText}>Result</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.eorButton}
                onPress={() => navigation.navigate("GraphScreen")}
              >
                <Text style={styles.eorButtonText}>Graphical Representation</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.eorButton}
                onPress={() => navigation.navigate("AIScreen")}
              >
                <Text style={styles.eorButtonText}>AI-Based Fluid Performance Predictor</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={backgroundImage} style={styles.fullScreenBackground}>
        <Animated.View style={[styles.screenContainer, { opacity: fadeAnim }]} />
      </ImageBackground>
    </SafeAreaView>
  );
}

// --- New Reusable Input Component ---
function InputField({ label, field, onChange }) {
  return (
    <View style={{ marginVertical: 10 }}>
      <Text style={{ color: "white", fontWeight: "bold" }}>{label}</Text>
      <View style={{ backgroundColor: "white", borderRadius: 5 }}>
        <TextInput
          style={{ padding: 10, color: "black" }}
          keyboardType="numeric"
          onChangeText={(text) => onChange(field, text)}
        />
      </View>
    </View>
  );
}
function ResultScreen({ route }) {
  const { selectedOption, inputValues, calculatedResult } = route.params;
  const eorFinalBackground = require("./assets/eornew.png");

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={eorFinalBackground} style={styles.fullScreenBackground}>
        <View style={styles.eorContainer}>
          <Text style={styles.screenTitle}>Result - {selectedOption}</Text>

          {/* Display inputs */}
          {Object.keys(inputValues).map((key, index) => (
            <Text key={index} style={styles.screenText}>
              {key}: {inputValues[key]}
            </Text>
          ))}

          {/* Display result */}
          <Text style={[styles.screenTitle, { marginTop: 20 }]}>
            Calculated Result: {calculatedResult?.toFixed(2)} %
          </Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

function GraphScreen() {
  const eorFinalBackground = require("./assets/eornew.png");

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={eorFinalBackground} style={styles.fullScreenBackground}>
        <View style={styles.eorContainer}>
          <Text style={styles.screenTitle}>Graphical Representation</Text>
          <Text style={styles.screenText}>Coming Soon...</Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

function AIScreen() {
  const eorFinalBackground = require("./assets/eornew.png");

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={eorFinalBackground} style={styles.fullScreenBackground}>
        <View style={styles.eorContainer}>
          <Text style={styles.screenTitle}>AI Fluid Predictor</Text>
          <Text style={styles.screenText}>Coming Soon...</Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

function AboutScreen() {
  return (
    <ImageBackground source={newBackground} style={styles.fullScreenBackground}>
      <View style={styles.screenContainer}>
        <Text style={styles.screenTitle}>About</Text>
        <Text style={styles.screenText}>
          This application is designed for fluid simulation and engineering optimizations.
        </Text>
      </View>
    </ImageBackground>
  );
}

function HowToUseScreen() {
  return (
    <ImageBackground source={newBackground} style={styles.fullScreenBackground}>
      <View style={styles.screenContainer}>
        <Text style={styles.screenTitle}>How to Use</Text>
        <Text style={styles.screenText}>
          Select a tool from the home screen to start using the application.
        </Text>
      </View>
    </ImageBackground>
  );
}

export default function App() {
  const [headerImage, setHeaderImage] = useState(initialLogo);

  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Home"
        screenOptions={{
          drawerPosition: "right",
          headerStyle: { backgroundColor: "#252426" },
          headerTintColor: "#fcdac0",
          headerTitle: () => (
            <Image
              source={headerImage}
              style={{ width: 140, height: 60, resizeMode: "contain" }}
            />
          ),
        }}
      >
        <Drawer.Screen name="Home">
          {(props) => <HomeScreen {...props} setHeaderImage={setHeaderImage} />}
        </Drawer.Screen>
        <Drawer.Screen
          name="Smart Fluid Rheology Simulator"
          component={ToolScreen}
          initialParams={{ setHeaderImage }}
        />
        <Drawer.Screen
          name="Geothermal Well Optimization Tool"
          component={ToolScreen}
          initialParams={{ setHeaderImage }}
        />
        <Drawer.Screen
          name="Enhanced Oil Recovery Planner"
          component={ToolScreen}
          initialParams={{ setHeaderImage }}
        />
        <Drawer.Screen name="ResultScreen" component={ResultScreen} options={{ drawerItemStyle: { height: 0 } }} />
        <Drawer.Screen name="GraphScreen" component={GraphScreen} options={{ drawerItemStyle: { height: 0 } }} />
        <Drawer.Screen name="AIScreen" component={AIScreen} options={{ drawerItemStyle: { height: 0 } }} />
        <Drawer.Screen name="About" component={AboutScreen} />
        <Drawer.Screen name="How to Use" component={HowToUseScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  fullScreenBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },  
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonRowContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 50,
    gap: 10,
  },
  squareButton: {
    backgroundColor: "transparent",
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    padding: 100,
    marginHorizontal: 135,
  },
  buttonText: {
    color: "white",
    fontSize: 23,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Cave Age",
  },
  screenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  screenText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
  eorContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  dropdown: {
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  dropdownText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdownOptions: {
    backgroundColor: "white",
    borderRadius: 5,
    marginBottom: 20,
    alignSelf: "flex-start",
    elevation: 3,
  },
  optionButton: {
    padding: 10,
  },
  optionText: {
    fontSize: 16,
    color: "black",
  },
  table: {
    borderWidth: 1,
    borderColor: "white",
    marginBottom: 30,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    width: 80,
    height: 50,
    borderWidth: 1,
    borderColor: "white",
  },
  eorButtonContainer: {
    marginTop: 20,
  },
  eorButton: {
    backgroundColor: "#411E38",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 8,
    alignItems: "center",
  },
  eorButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});

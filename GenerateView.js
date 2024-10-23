
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
  Modal
} from "react-native";
import { FlatList } from "react-native";
import { useState, useEffect, useRef } from "react";
import { ScrollView } from "react-native";
import { ApiHandler } from "./ApiHandler";
import { LinearGradient } from "expo-linear-gradient";
import { DiscardButtonAnimation } from "./ButtonAnimation";
import Slider from '@react-native-community/slider'; // Vi måste importera denna för vi måste ska kunna dölja den
import { ColorPicker } from 'react-native-color-picker';
import { MovableView } from "./MovableView";

// Dummybild som används tillfälligt
const localImage = require("./assets/memeinator.png");

// Skapar en array av dummybilden (behövs?)
const dummyImageData = new Array(10).fill(localImage);

// här vi gör en osynlig slider för pickern krävde en slider. rör ej!
const DummySlider = () => {
    return <View style={{ height: 0, width: 0 }} />;
};
export default DummySlider;


export function GenerateView() {
  // Hämtar data och fetchMemes() från ApiHandler
  const { data, fetchMemes } = ApiHandler();
  const [currentMeme, setCurrentMeme] = useState(null);
  const [texts, setTexts] = useState([]);
  const [textFieldsCount, setTextFieldsCount] = useState(0);
  const [imageSource, setImageSource] = useState(localImage);
  const [showTextInput, setShowTextInput] = useState(true);
const [colors, setColors] = useState([]);
    const [isColorPickerVisible, setColorPickerVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null); //följ vilken input färg som ändras
    const [selectedColor, setSelectedColor] = useState('#000000'); // 
  const [memes, setMemes] = useState([]);

  //----------------------------------------------------------------------------------------------
  // Sätter imgage-dimensioner i onPress på en meme. 
  const [imgDim, setImgDim] = useState({x: 0, y: 0, width: 0, height: 0, pageX: 0, pageY: 0})
  const [imgRefSource, setImgRefSource] = useState("");
  const imageRef = useRef(null);

  const imageAttributes = () => {
    if (imageRef.current) {
      // Använd ref för att mäta positionen
      imageRef.current.measure((x, y, width, height, pageX, pageY) => {
        console.log('x:', x, 'y:', y); // Position relativt föräldern
        console.log('width:', width, 'height:', height); // Absolut position på skärmen
        console.log('pageX:', pageX, 'pageY:', pageY); // Absolut position på skärmen
        setImgDim({x: x, y: y, width: width, height: height, pageX: pageX, pageY: pageY})
      });
    }
  };

  // Sätter position.
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Hanterar position på texten nedan i MovableView på rad 172 och skickar detta via properties.
  // Används bara till att skriva ut position just nu på rad 152.
  const positionChange = (newPosition) => {
    setPosition(newPosition);
  };

   //----------------------------------------------------------------------------------------------


  useEffect(() => {
    const fetchTextFieldCount = () => {
      // Antalet hämtas från API anrop
      const responseCount = 0;
      // Uppdatera textFieldsCount med svaret
      setTextFieldsCount(responseCount);
      setTexts(Array(responseCount).fill(""));
    };
    fetchTextFieldCount();
    fetchMemes();
    getMemesFromAsyncStorage();
  }, []);

  const handleTextChange = (text, index) => {
    // Kopia av textarrayen som skrivs i input
    const newTexts = [...texts];
    // Uppdaterar texten i texts-arrayen på rätt index
    newTexts[index] = text;
    // Uppdaterar state med den nya texts-arrayen.
    setTexts(newTexts);
  };
  
    const handleColorChange = (selectedColor, index) => {
        const newColors = [...colors];
        newColors[index] = selectedColor;
        setColors(newColors);

    };

    const openColorPicker = (index) => {
        setSelectedIndex(index);  // koppla färg till vald input index
        setColorPickerVisible(true);  // visa colorPicker modalen

    };

    const closeColorPicker = () => {
        setColorPickerVisible(false);  //Dölj colorPicker modalen
    };


    //Nollställer textArrayen vid discard
    const handleDiscard = () => {
        setTexts(Array(textFieldsCount).fill(""))
        setCurrentMeme(null)
        setImageSource(localImage)
        setShowTextInput(false)
    }


  const saveMemeInAsyncStorage = async () => {
    // Generating a unique id for each meme
    const memeToSave = { id: Date.now(), url: currentMeme.url, texts: texts };
    // Create array with new meme
    const updatedMemes = [...memes, memeToSave];
    setMemes(updatedMemes);

    try {
      // Put array in storage
      await AsyncStorage.setItem("memesList", JSON.stringify(updatedMemes));
      console.log("Meme Saved!");
      alert("Meme Saved!");
    } catch (error) {
      console.error("Error saving Meme:", error);
    }
  };

  const getMemesFromAsyncStorage = async () => {
    try {
      // Get array from storage
      const storedMemes = await AsyncStorage.getItem("memesList");
      if (storedMemes !== null) {
        setMemes(JSON.parse(storedMemes));
        console.log(
          "Retrieved memes from asyncStorage:",
          JSON.parse(storedMemes)
        );
      } else {
        console.log("Async Storage contains no memes");
      }
    } catch (error) {
      console.error("Error retrieving memes:", error);
    }
  };


  return (
    <LinearGradient
        colors={['#00D9E1', '#133CE3', '#8D4EFA']} // Gradient colors
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={styles.container}
    >
        <Text style={styles.titleTextStyle}> Generate Your Own Memes </Text>

        {/* Drag-position utskrivna i appen */}
        <Text style={styles.titleTextStyle}> {`X: ${position.x}, Y: ${position.y}`} </Text>

        <View style={styles.memeContainer}>
            {/* Sätter bild till den meme du klickar på. Finns ingen, väljs dummybild - JH */}
            <Image
                source={imgRefSource ? { uri: imgRefSource } : imageSource}
                style={styles.imageStyle}
                ref={imageRef}
                resizeMode="contain"
                onLoad={imageAttributes}
            />

            {/* Varje text som skrivs i inputs målas upp ovanpå memebilden, just nu bara på olika höjder av bilden.
            Ska anpassas efter vilka kordinater som hämtas i APIn */}
            {texts.map((text, index ) => ( 

              <MovableView key={index} style={styles.overlayText}
              startingX={ 0 } startingY={ 50 + index * 40 }
              enteredText={text} color={colors[index]} position={positionChange} imgDim={imgDim} />

            ))}
            </View>
            
            <View>
        </View> 

        <FlatList
            data={data}
            horizontal={true}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <Pressable
                    onPress={() => {
                        setCurrentMeme(item);
                        setImgRefSource(item.url);                       
                        setTextFieldsCount(item.box_count);
                        setTexts(Array(item.box_count).fill(""));
                        setShowTextInput(true);
                    }}
                >
                    <Image  source={{ uri: item.url }} style={styles.memeScroll} />
                </Pressable>
            )}
            ListEmptyComponent={<Text>Loading...</Text>}
            style={styles.listStyle}
        />

        <ScrollView style={styles.scrollView}>
            {/* Skapar visst antal textinputs baserat på värdet av textfieldCount, detta baseras också på APIns hämtning. */}
            {showTextInput &&
                Array.from({ length: textFieldsCount }).map((_, index) => (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <TextInput
                            style={[styles.textInput, { color: colors[index] }]}
                            placeholder={`Enter text ${index + 1}`}
                            value={texts[index]}
                            onChangeText={(text) => handleTextChange(text, index)}
                             
                        />
                        <LinearGradient
                            colors={['#f43b47', '#0ba360']}
                            style={styles.colorButtonGradient}
                        >
                            <Pressable style={styles.colorPickButton} onPress={() => openColorPicker(index)}>
                                <Text></Text>
                            </Pressable>
                        </LinearGradient>
                    </View>
                ))}
        </ScrollView>

        {isColorPickerVisible && (
            <Modal transparent={true} visible={isColorPickerVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.colorPickerContainer}>
                        <ColorPicker
                            onColorSelected={(colors) => {
                                handleColorChange(colors, selectedIndex);
                                closeColorPicker();
                            }}
                            style={{ flex: 1 }}
                            sliderComponent={DummySlider} //Lägg in den osynliga dummy slidern så colorPicker inte gnäller!
                        />
                        <View style={styles.buttonsContainer}>
                            <Pressable
                                style={styles.colorButton}
                                onPress={() => handleColorChange('#000000', selectedIndex)}
                            >
                                <Text style={styles.colorButtonText}>Black</Text>
                            </Pressable>
                            <Pressable
                                style={styles.colorButton}
                                onPress={() => handleColorChange('#FFFFFF', selectedIndex)}
                            >
                                <Text style={styles.colorButtonText}>White</Text>
                            </Pressable>
                        </View>
                    </View>

                    <Pressable style={styles.closeButton} onPress={closeColorPicker}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </Pressable>
                </View>
            </Modal>
        )}

        <View style={styles.buttonContainer}>
            <DiscardButtonAnimation
                onPress={handleDiscard}
                buttonText="Discard"
                buttonStyle={styles.pressableStyle}
                textStyle={styles.buttonTextStyle}
                >
            </DiscardButtonAnimation>

            <Pressable style={styles.pressableStyleSave} onPress={() => saveMemeInAsyncStorage()} >
                <Text style={styles.buttonTextStyle}>Save</Text>
            </Pressable>
        </View>
    </LinearGradient>
);
}


const styles = StyleSheet.create({

    //Style för hela skärmen
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        padding: 20,

    },
    scrollView: {
        height: 150
    },

    //Style för titeln
    titleTextStyle: {
        marginTop: 30,
        marginBottom: 20,
        fontWeight: 'bold',
        color: 'white',
        fontSize: 25
    },

    //Style för "choose your meme" text <-- Do we need this text here? - Juhee
    // underTitleTextStyle: {
    //     marginTop: 10,
    //     fontWeight: 'normal',
    //     color: 'white',
    //     fontSize: 18
    // },

    //Style för den bild som visar den skapade memen med text
    imageStyle: {
        width: 350,
        height: 350,
    },

    //Style för bilder i listan där hämtade memes visas
    listImage: {
        width: 100,
        height: 100,
        marginHorizontal: 20,
    },

    //Style för själva listan
    listStyle: {
        width: 300,
        height: 300,
        marginTop: 20,
        maxHeight: 120
    },

    //Style på container för att overlayText ska centreras med image
    memeContainer: {
        position: "relative",
        alignItems: "center",

    },

    //Style för texten ovanpå meme
    overlayText: {
        position: "absolute",
        color: "black",
        fontSize: 25,
        backgroundColor: 'transparent',
        padding: 5,
        borderRadius: 5,
    },

    //Style för inputfields
    textInput: {
        height: 35,
        width: 200,
        padding: 10,
        marginTop: 10,
        backgroundColor: 'white',
        borderRadius: 5,
    },

    //Style för buttonContainer
    buttonContainer: {
        flexDirection: "row",
        width: '100%',
        height: 90,
        paddingTop: 10,
        justifyContent: "space-between"
    },

    //Style för knappar
    pressableStyle: {
        flex: 1,
        margin: 10,
        backgroundColor: "lightgray",
        alignItems: "center",
        padding: 10,
        borderRadius: 5,
        justifyContent: "center"
    },

    pressableStyleSave: {
        flex: 1,
        margin: 10,
        backgroundColor: "#FFCF23",
        alignItems: "center",
        padding: 10,
        borderRadius: 5,
        justifyContent: "center"
    },

    buttonTextStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    },

    memeScroll: {
        margin: 10,
        marginBottom: 40,
        width: 70,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
    },

    colorPicker: {
        width: 50,
        height: 50,
        backgroundColor: '#D3D3D398',
        borderRadius: 35,
        marginTop: 25,
        //Knappar för "svart" & "Vit" i Color pickern
    }, colorButton: {
        backgroundColor: "lightgray",
        padding: 10,
        magin: 10,
        borderRadius: 5,
        margintop: 10,
    },
    //Knapp För att öppna colorPicker.
    colorPickButton: {
        padding: 10,
        marginLeft: 10,
        borderRadius: 5,
        margintop: 10,
        height: 15,
        width: 15,
    },
    // Gradient för knapp till öppna colorPicker
    colorButtonGradient: {
        borderRadius: 5,
        padding: 10,
    },
   // mörklägger bakgrunden när man öppnar ColorPicker
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    //Design för ColorPicker rutan 
    colorPickerContainer: {
        margin: 20,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        flex: 0.5,
        justifyContent: 'center',
    },
    // till knappen för att stänga colorPicker
    closeButton: {
        backgroundColor: "lightgray",
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    closeButtonText: {
        color: 'black',
        textAlign: 'center',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        width: '80%', // Make buttons container narrower
    },
})


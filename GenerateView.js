import AsyncStorage from '@react-native-async-storage/async-storage'
import { View, Text, Button, StyleSheet, Image, TextInput, Pressable} from "react-native";
import { FlatList } from 'react-native';
import { useState, useEffect} from 'react';
import { ScrollView } from 'react-native';
import { ApiHandler } from './ApiHandler'

// Dummybild som används tillfälligt
const localImage = require("./assets/Image20240927091254.png")

// Skapar en array av dummybilden
const dummyImageData = new Array(10).fill(localImage);

export function GenerateView(){
    // Hämtar data och fetchMemes() från ApiHandler
    const { data, fetchMemes } = ApiHandler();
    const [currentMeme, setCurrentMeme] = useState(null)

    const [texts, setTexts] = useState([])
    const [textFieldsCount, setTextFieldsCount] = useState(0);

    
    useEffect(() =>{
        const fetchTextFieldCount = () => {
            //Antalet hämtas från API anrop
            const responseCount = 4;
             // Uppdatera textFieldsCount med svaret
            setTextFieldsCount(responseCount)
            setTexts(Array(responseCount).fill(""));
        }
        fetchTextFieldCount()
        fetchMemes()
    },[]);

    const handleTextChange = (text, index) =>{
        // Kopia av textarrayen som skrivs i input
        const newTexts = [... texts] 
        // Uppdaterar texten i texts-arrayen på rätt index
        newTexts[index] = text 
        // Uppdaterar state med den nya texts-arrayen.
        setTexts(newTexts) 
    }
    //Nollställer textArrayen vid discard
    const handleDiscard = () =>{
        setTexts(Array(textFieldsCount).fill(""))
    }

    return(
        <View style={[styles.container]}>

            <Text style={styles.titleTextStyle}> Generate Your Own Memes </Text>

            <View style={styles.memeContainer}>
            
            {/* Sätter bild till den meme du klickar på. Finns ingen, väljs dummybild - JH */}
            <Image 
                source={currentMeme
                    ?  { uri: currentMeme.url }
                    : localImage} 
                style={styles.imageStyle} 
            ></Image>

            {/* Varje text som skrivs i inputs målas upp ovanpå memebilden, just nu bara på olika höjder av bilden.
            Ska anpassas efter vilka kordinater som hämtas i APIn */}
            {texts.map((text, index ) => (
                <Text key={index} style={[styles.overlayText, { top: 100 + index * 40 }]}>
                    {text}
                </Text>


            ))}
            </View>
            {/* Fick flytta ut denna och ändra till scrollView på rad 78 då renderingen inte fungerade på ios - JH */}
            <View>
            <Text style={styles.underTitleTextStyle}>Choose Your Meme</Text>
            </View>

            
            <ScrollView horizontal={true} style={styles.listStyle}>
            {
                // Tillagd för att hämta memes från API - JH
                data ? (data.map(item => (<Pressable key={item.id} onPress={() => setCurrentMeme(item)}><Image source={{ uri: item.url }} style={styles.memeScroll} /></Pressable>)))
                : (<Text>Loading</Text>)
            }
            </ScrollView>

              <ScrollView>

                {/* Skapar visst antal textinputs baserat på värdet av textfieldCount, detta baseras också på APIns hämtning. */}
              {Array.from({ length: textFieldsCount }).map((_, index) => (
                <TextInput
                    key={index}
                    style={styles.textInput}
                    placeholder={`Enter text ${index + 1}`}
                    value={texts[index]} 
                    onChangeText={(text) => handleTextChange(text, index)}
                />
            ))}
              </ScrollView>

              <View style={styles.buttonContainer}>
                <Pressable style={styles.pressableStyle} 
                onPress = { () => alert("Meme Saved!")}>
                    <Text>Save</Text>
                    </Pressable>
                <Pressable style={styles.pressableStyle} onPress={handleDiscard}>
                    <Text>Discard</Text>
                    </Pressable>

              </View>
           
                


        </View>




    )


}

const styles = StyleSheet.create({
    //Style för hela skärmen
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        padding: 20,
        
    },
    //Style för titeln
    titleTextStyle: {
        marginTop: 20
    },
    //Style för "choose your meme" text
    underTitleTextStyle: {
        marginTop: 20
    },
    //Style för den bild som visar den skapade memen med text
    imageStyle: {
        width: 250,
        height: 250,
        marginTop: 20, 
        borderWidth: 2,
        borderColor: "black"
    },
    //Style för bilder i listan där hämtade memes visas
    listImage : {
        width: 100, 
        height: 100,
        marginHorizontal: 20, 
    },
    //Style för själva listan
    listStyle: {
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
        width: "100%",
        padding: 10,
        marginTop: 10,
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 5,
    },
    //Style för buttonContainer
    buttonContainer: {
        flexDirection: "row",
        width: "100%",
        padding: 20,
        justifyContent: "space-between"
        
    },
    //Style för knappar
    pressableStyle: {
        flex: 1, 
        margin: 10, 
        backgroundColor: "lightgray", 
        alignItems: "center", 
        padding: 10,
    },
    memeScroll: {
        margin: 20,
        borderColor: 'black',
        borderRadius: 5,
        borderWidth: 5,
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
    }
    
})
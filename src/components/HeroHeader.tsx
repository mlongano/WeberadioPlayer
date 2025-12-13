import { Image, View } from "react-native";
import { Text } from "react-native-paper";

export default function HeroHeader({ h1, h2, imgsrc }: any) {
  return (
    <View>
      <View style={{  marginTop: 0, marginLeft: 0, marginRight: 0 }}>
        <View >
          <Text style={{ fontWeight: 'bold', marginTop: 0, marginLeft: 0, marginRight: 0 }}>{h1}</Text>
          <Text style={{ fontWeight: 'bold', marginTop: 0, marginLeft: 0, marginRight: 0 }}>{h2}</Text>
        </View>
        <Image source={imgsrc} alt='Testimonial' />
      </View>
    </View>
  )
};
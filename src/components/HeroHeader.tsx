import { Image, ImageSourcePropType, View } from "react-native";
import { Text } from "react-native-paper";

interface HeroHeaderProps {
  h1: string;
  h2?: string;
  imgsrc: ImageSourcePropType;
}

export default function HeroHeader({ h1, h2, imgsrc }: HeroHeaderProps) {
  return (
    <View>
      <View style={{  marginTop: 0, marginLeft: 0, marginRight: 0 }}>
        <View >
          <Text style={{ fontWeight: 'bold', marginTop: 0, marginLeft: 0, marginRight: 0 }}>{h1}</Text>
          <Text style={{ fontWeight: 'bold', marginTop: 0, marginLeft: 0, marginRight: 0 }}>{h2}</Text>
        </View>
        <Image source={imgsrc} alt='Testimonial' accessible={true} accessibilityLabel={h1 || 'Immagine di testata'} />
      </View>
    </View>
  )
};
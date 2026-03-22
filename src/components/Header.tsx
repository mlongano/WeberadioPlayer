import { Text, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
interface Props {
  ascoltatori: number;
  titleSize: number;
  subtitleSize: number;
  color: string;
}

export default function Header(
  { ascoltatori, titleSize, subtitleSize, color }: Props
) {
  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }} accessibilityRole="header" accessibilityLabel="WeBe Radio">
        <Icon name='radio-tower' color={color} size={titleSize} accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants" />
        <Text style={{ color: color, fontSize: titleSize, fontWeight: 'bold', marginTop: 0, marginLeft: 0, marginRight: 0 }}>WeBe Radio</Text>
        <Icon name='radio-tower' color={color} size={20} accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants" />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
      </View>
    </>
  );
}
import { Pressable, Text } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  active: boolean;
  label: string;
  onPress: () => void;
  testID?: string;
};

export function FavoriteStarButton({ active, label, onPress, testID }: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={active ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className="h-9 w-9 items-center justify-center"
    >
      <Text className="text-lg leading-none" style={{ color: active ? "#facc15" : colors.textTertiary }}>
        {active ? "★" : "☆"}
      </Text>
    </Pressable>
  );
}

import { FontAwesome6 } from "@expo/vector-icons";
import * as Sentry from "@sentry/react-native";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SentryFeedbackButton = () => {
  const insets = useSafeAreaInsets();

  return (
    <View>
      <Pressable
        onPress={() => Sentry.showFeedbackWidget()}
        className={`flex-row items-center gap-2 rounded-2xl py-3 justify-center border w-full border-border bg-card`}
      >
        <FontAwesome6 name="comment-dots" size={14} color="hsl(136 42% 92%)" />
        <Text className={`text-sm font-semibold text-foreground`}>Feedback</Text>
      </Pressable>
    </View>
  );
};
export default SentryFeedbackButton;
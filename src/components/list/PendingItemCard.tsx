import { GroceryItem, useGroceryStore } from "@/store/grocery-store";
import { useAuth } from "@clerk/expo";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";

const priorityPillBg = {
  low: "bg-priority-low",
  medium: "bg-priority-medium",
  high: "bg-priority-high",
};

const priorityPillText = {
  low: "text-priority-low-foreground",
  medium: "text-priority-medium-foreground",
  high: "text-priority-high-foreground",
};

const PendingItemCard = ({ item }: { item: GroceryItem }) => {
  const { userId } = useAuth();
  const { removeItem, updateQuantity, togglePurchased } = useGroceryStore();
  const [isCompleting, setIsCompleting] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  const handleComplete = () => {
    if (isCompleting) return;

    setIsCompleting(true);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 16,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      await togglePurchased(userId, item.id);

      // Reset values in case the item remains visible due to API/state failure.
      opacity.setValue(1);
      translateX.setValue(0);
      setIsCompleting(false);
    });
  };

  return (
    <Animated.View
      className="rounded-3xl border border-border bg-card p-4"
      style={{
        opacity,
        transform: [{ translateX }],
      }}
    >
      <View className="flex-row items-start gap-3">
        <Pressable
          className="mt-1 size-6 items-center justify-center rounded-full border-2 border-border bg-card"
          onPress={handleComplete}
          disabled={isCompleting}
        >
          {isCompleting ? <FontAwesome6 name="check" size={11} color="#3b5a4a" /> : null}
        </Pressable>

        <View className="flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="flex-1 text-lg font-semibold text-card-foreground">{item.name}</Text>
            <View className={`rounded-full px-3 py-1 ${priorityPillBg[item.priority]}`}>
              <Text className={`text-xs font-bold uppercase ${priorityPillText[item.priority]}`}>
                {item.priority}
              </Text>
            </View>
          </View>

          <View className="mt-2 flex-row items-center gap-2">
            <View className="rounded-full bg-secondary px-3 py-1">
              <Text className="text-xs font-semibold text-secondary-foreground">
                {item.category}
              </Text>
            </View>
          </View>

          <View className="mt-3 flex-row items-center gap-2">
            <Pressable
              className="h-8 w-8 items-center justify-center rounded-xl border border-border bg-muted"
              onPress={() => updateQuantity(userId, item.id, Math.max(1, item.quantity - 1))}
            >
              <FontAwesome6 name="minus" size={12} color="#3b5a4a" />
            </Pressable>

            <Text className="min-w-9 text-center text-base font-semibold text-foreground">
              {item.quantity}
            </Text>

            <Pressable
              className="h-8 w-8 items-center justify-center rounded-xl border border-border bg-muted"
              onPress={() => updateQuantity(userId, item.id, item.quantity + 1)}
            >
              <FontAwesome6 name="plus" size={12} color="#3b5a4a" />
            </Pressable>
          </View>
        </View>

        <Pressable
          className="h-9 w-9 items-center justify-center rounded-xl bg-destructive"
          onPress={() => removeItem(userId, item.id)}
          disabled={isCompleting}
        >
          <FontAwesome6 name="trash" size={13} color="#d45f58" />
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default PendingItemCard;
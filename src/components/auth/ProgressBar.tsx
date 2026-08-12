import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function ProgressBar({ currentStep, totalSteps, labels }: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  const progress = currentStep / totalSteps;

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: progress,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  }, [progress]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View className="mb-6">
      {/* Step indicators */}
      <View className="flex-row justify-between mb-3 px-1">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isActive = stepNum <= currentStep;
          const isCurrent = stepNum === currentStep;
          return (
            <View key={i} className="flex-row items-center">
              <View
                className={`w-7 h-7 rounded-full items-center justify-center ${
                  isActive
                    ? "bg-blue-600"
                    : "bg-gray-200"
                }`}
                style={isCurrent ? {
                  shadowColor: "#2563EB",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 4,
                } : undefined}
              >
                <Text
                  className={`text-xs font-bold ${
                    isActive ? "text-white" : "text-gray-500"
                  }`}
                >
                  {stepNum}
                </Text>
              </View>
              {labels && labels[i] ? (
                <Text
                  className={`text-xs ml-1.5 font-medium ${
                    isActive ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  {labels[i]}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>

      {/* Progress bar track */}
      <View className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <Animated.View
          className="h-full bg-blue-600 rounded-full"
          style={{ width: widthInterpolation }}
        />
      </View>
    </View>
  );
}

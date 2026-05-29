import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

interface PolicyAgreementModalProps {
    visible: boolean;
    title: string;
    content: string;
    loading?: boolean;
    onAccept: () => void;
}

const { width, height } = Dimensions.get("window");

export function PolicyAgreementModal({
    visible,
    title,
    content,
    loading = false,
    onAccept,
}: PolicyAgreementModalProps) {
    const [hasReachedBottom, setHasReachedBottom] = useState(false);

    const handleScroll = (event: any) => {
        const {
            layoutMeasurement,
            contentOffset,
            contentSize,
        } = event.nativeEvent;

        const padding = 30;

        const reachedBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - padding;

        if (reachedBottom) {
            setHasReachedBottom(true);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <View
                style={{
                    flex: 1,
                    backgroundColor: "rgba(15,23,42,0.75)",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 16,
                }}
            >
                <View
                    style={{
                        width: width > 768 ? 700 : "100%",
                        maxWidth: 700,
                        height: height * 0.85,
                        backgroundColor: "#FFFFFF",
                        borderRadius: 28,
                        overflow: "hidden",
                    }}
                >
                    {/* Header */}
                    <LinearGradient
                        colors={["#2563EB", "#1D4ED8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            paddingHorizontal: 24,
                            paddingVertical: 22,
                        }}
                    >
                        <Text
                            style={{
                                color: "#FFFFFF",
                                fontSize: 24,
                                fontWeight: "700",
                            }}
                        >
                            {title}
                        </Text>

                        <Text
                            style={{
                                color: "#DBEAFE",
                                marginTop: 6,
                                fontSize: 14,
                            }}
                        >
                            Please read the policy carefully before continuing.
                        </Text>
                    </LinearGradient>

                    {/* Scrollable Content */}
                    <ScrollView
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        onContentSizeChange={(contentWidth, contentHeight) => {
                            const visibleHeight = height * 0.85 - 220;

                            if (contentHeight <= visibleHeight) {
                                setHasReachedBottom(true);
                            }
                        }}
                        showsVerticalScrollIndicator
                        contentContainerStyle={{
                            padding: 24,
                            paddingBottom: 40,
                        }}
                        style={{
                            flex: 1,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 15,
                                lineHeight: 26,
                                color: "#374151",
                            }}
                        >
                            {content}
                        </Text>

                        {!hasReachedBottom && (
                            <View
                                style={{
                                    marginTop: 20,
                                    padding: 12,
                                    backgroundColor: "#EFF6FF",
                                    borderRadius: 12,
                                }}
                            >
                                <Text
                                    style={{
                                        color: "#1D4ED8",
                                        textAlign: "center",
                                        fontWeight: "600",
                                    }}
                                >
                                    Scroll to the bottom to enable agreement
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View
                        style={{
                            padding: 20,
                            borderTopWidth: 1,
                            borderTopColor: "#E5E7EB",
                            backgroundColor: "#FFFFFF",
                        }}
                    >
                        <Pressable
                            disabled={!hasReachedBottom || loading}
                            onPress={onAccept}
                            style={{
                                opacity:
                                    !hasReachedBottom || loading ? 0.6 : 1,
                            }}
                        >
                            <LinearGradient
                                colors={["#2563EB", "#1D4ED8"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                    paddingVertical: 18,
                                    borderRadius: 18,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text
                                        style={{
                                            color: "#FFFFFF",
                                            fontSize: 16,
                                            fontWeight: "700",
                                        }}
                                    >
                                        I Agree & Continue
                                    </Text>
                                )}
                            </LinearGradient>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import { useAppFonts } from "../../hooks/useAppFonts";

interface PolicyAgreementModalProps {
    visible: boolean;
    title: string;
    content: string;
    loading?: boolean;
    onAccept: () => void;
}

export function PolicyAgreementModal({
    visible,
    title,
    content,
    loading = false,
    onAccept,
}: PolicyAgreementModalProps) {
    const { width, height } = useWindowDimensions();
    const [hasReachedBottom, setHasReachedBottom] = useState(false);
    const { t } = useTranslation();
    const { styleRegular, styleBold } = useAppFonts();

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

    const modalHeight = height * (height < 600 ? 0.95 : 0.85);

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
                        width: width > 768 ? 640 : "100%",
                        maxWidth: 640,
                        height: modalHeight,
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
                            style={[{
                                color: "#FFFFFF",
                                fontSize: 22,
                                fontWeight: "700",
                            }, styleBold]}
                        >
                            {title}
                        </Text>

                        <Text
                            style={[{
                                color: "#DBEAFE",
                                marginTop: 6,
                                fontSize: 13,
                            }, styleRegular]}
                        >
                            {t("please_read_policy_carefully")}
                        </Text>
                    </LinearGradient>

                    {/* Scrollable Content */}
                    <ScrollView
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        onContentSizeChange={(contentWidth, contentHeight) => {
                            const visibleHeight = modalHeight - 180;

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
                            style={[{
                                fontSize: 14,
                                lineHeight: 24,
                                color: "#374151",
                            }, styleRegular]}
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
                                    style={[{
                                        color: "#1D4ED8",
                                        textAlign: "center",
                                        fontWeight: "600",
                                        fontSize: 13,
                                    }, styleBold]}
                                >
                                   {t("scroll_to_bottom_to_enable_agreement")}
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
                                    paddingVertical: 16,
                                    borderRadius: 16,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text
                                        style={[{
                                            color: "#FFFFFF",
                                            fontSize: 16,
                                            fontWeight: "700",
                                        }, styleBold]}
                                    >
                                        {t("i_agree_and_continue")}
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
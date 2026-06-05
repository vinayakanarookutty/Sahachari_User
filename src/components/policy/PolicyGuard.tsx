import { ReactNode } from "react";
import {
  ActivityIndicator,
  View,
} from "react-native";

import { useTranslation } from "react-i18next";
import { usePolicyAgreement } from "../../hooks/usePolicy";
import { PolicyAgreementModal } from "./PolicyAgreementModal";

interface Props {
  children: ReactNode;
}

export function PolicyGuard({
  children,
}: Props) {
  const {
    policy,
    showPolicy,
    acceptPolicy,
    isInitialLoading,
    isAccepting,
  } = usePolicyAgreement();
  const {t}= useTranslation();

  // Prevent app flashing before policy status is known
  if (isInitialLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      {children}

      <PolicyAgreementModal
        visible={showPolicy}
        title={
          policy?.title ||
          t("terms_and_conditions")
        }
        content={policy?.content || ""}
        loading={isAccepting}
        onAccept={acceptPolicy}
      />
    </>
  );
}
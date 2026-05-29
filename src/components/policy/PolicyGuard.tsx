import { ReactNode } from "react";
import {
  ActivityIndicator,
  View,
} from "react-native";

import { PolicyAgreementModal } from "./PolicyAgreementModal";
import { usePolicyAgreement } from "../../hooks/usePolicy";

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
          "Terms & Conditions"
        }
        content={policy?.content || ""}
        loading={isAccepting}
        onAccept={acceptPolicy}
      />
    </>
  );
}
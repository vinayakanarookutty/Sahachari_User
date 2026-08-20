import React, { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import Constants from 'expo-constants';
import { API_BASE_URL } from '../config/env';
import { AppUpdateModal } from './AppUpdateModal';

interface UpdateInfo {
  updateAvailable: boolean;
  forceUpdate: boolean;
  currentVersion: string;
  minimumVersion: string;
  playStoreUrl: string;
  appStoreUrl: string;
  title: string;
  description: string;
}

export const AppUpdateObserver: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  const installedVersion =
    Constants.expoConfig?.version ||
    Constants.manifest2?.extra?.expoClient?.version ||
    '1.0.35';

  const checkForUpdate = async () => {
    try {
      const baseUrls = [
        API_BASE_URL,
        'http://localhost:5000',
        'http://10.0.2.2:5000',
        'http://192.168.0.190:5000',
      ].filter(Boolean);

      for (const base of baseUrls) {
        try {
          const res = await fetch(
            `${base}/app-updates/user?version=${encodeURIComponent(installedVersion)}`
          );
          if (res.ok) {
            const data: UpdateInfo = await res.json();
            if (data && data.updateAvailable) {
              setUpdateInfo(data);
              setModalVisible(true);
              return;
            }
          }
        } catch (e) {
          // try next url
        }
      }
    } catch (err) {
      console.warn('[AppUpdateObserver] Failed to check for update:', err);
    }
  };

  useEffect(() => {
    checkForUpdate();

    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          checkForUpdate();
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [installedVersion]);

  if (!modalVisible || !updateInfo) {
    return null;
  }

  return (
    <AppUpdateModal
      visible={modalVisible}
      currentVersion={updateInfo.currentVersion}
      installedVersion={installedVersion}
      title={updateInfo.title}
      description={updateInfo.description}
      playStoreUrl={updateInfo.playStoreUrl}
      appStoreUrl={updateInfo.appStoreUrl}
      forceUpdate={updateInfo.forceUpdate}
      onDismiss={() => setModalVisible(false)}
    />
  );
};

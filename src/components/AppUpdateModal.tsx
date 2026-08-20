import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Linking,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { DownloadCloud, Sparkles, AlertCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface AppUpdateModalProps {
  visible: boolean;
  currentVersion: string;
  installedVersion: string;
  title?: string;
  description?: string;
  playStoreUrl?: string;
  appStoreUrl?: string;
  forceUpdate?: boolean;
  onDismiss?: () => void;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  visible,
  currentVersion,
  installedVersion,
  title = 'New Update Available!',
  description = 'A new version of Sahachari is available with enhancements and bug fixes. Update now for the best experience!',
  playStoreUrl = 'https://play.google.com/store/apps/details?id=com.corestoneinnovation.sahachariuser',
  appStoreUrl = '0',
  forceUpdate = false,
  onDismiss,
}) => {
  if (!visible) return null;

  const handleUpdate = async () => {
    try {
      let targetUrl = playStoreUrl;

      if (Platform.OS === 'ios') {
        if (appStoreUrl && appStoreUrl !== '0' && appStoreUrl.startsWith('http')) {
          targetUrl = appStoreUrl;
        } else {
          targetUrl = playStoreUrl;
        }
      }

      if (targetUrl && (await Linking.canOpenURL(targetUrl))) {
        await Linking.openURL(targetUrl);
      } else {
        await Linking.openURL(playStoreUrl);
      }
    } catch (err) {
      console.warn('Failed to open app store link:', err);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        if (!forceUpdate && onDismiss) {
          onDismiss();
        }
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Badge Icon */}
          <View style={styles.iconCircle}>
            <DownloadCloud size={38} color="#FFFFFF" strokeWidth={2.2} />
          </View>

          {/* Version tag */}
          <View style={styles.versionBadge}>
            <Sparkles size={13} color="#2563EB" strokeWidth={2.5} />
            <Text style={styles.versionBadgeText}>
              v{installedVersion}  →  v{currentVersion}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Description */}
          <Text style={styles.description}>{description}</Text>

          {/* Force Update Warning Notice if applicable */}
          {forceUpdate && (
            <View style={styles.warningContainer}>
              <AlertCircle size={14} color="#D97706" />
              <Text style={styles.warningText}>
                This is a required update to continue using the app.
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdate}
              activeOpacity={0.88}
            >
              <Text style={styles.updateButtonText}>Update Now</Text>
            </TouchableOpacity>

            {!forceUpdate && onDismiss && (
              <TouchableOpacity
                style={styles.laterButton}
                onPress={onDismiss}
                activeOpacity={0.7}
              >
                <Text style={styles.laterButtonText}>Later</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: Math.min(width - 48, 380),
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 12,
  },
  versionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  warningText: {
    fontSize: 11.5,
    color: '#B45309',
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  updateButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  laterButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  laterButtonText: {
    color: '#94A3B8',
    fontSize: 13.5,
    fontWeight: '600',
  },
});

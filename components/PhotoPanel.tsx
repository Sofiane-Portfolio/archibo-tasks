import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AnimatedButton } from './ui/AnimatedButton';
import { Colors, Radius, Spacing } from '../constants/theme';
import type { Task } from '../types';

const { width } = Dimensions.get('window');

interface PhotoPanelProps {
  task: Task;
  onPhotoConfirmed: (uri: string) => void;
  onCancel: () => void;
}

export const PhotoPanel: React.FC<PhotoPanelProps> = ({
  task,
  onPhotoConfirmed,
  onCancel,
}) => {
  const [photoUri, setPhotoUri] = useState<string | null>(task.photoUri ?? null);
  const [loading, setLoading] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        "Archibo Tasks a besoin d'accéder à votre caméra pour photographier le chantier.",
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleCamera = async () => {
    setLoading(true);
    try {
      const granted = await requestPermission();
      if (!granted) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'accéder à la caméra.');
    } finally {
      setLoading(false);
    }
  };

  const handleGallery = async () => {
    setLoading(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', "Accès à la galerie requis.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
      });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'accéder à la galerie.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (photoUri) {
      onPhotoConfirmed(photoUri);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.handle} />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{task.title}</Text>
          <Text style={styles.headerSite}>● {task.site}</Text>
        </View>
        <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
          <Text style={styles.closeTxt}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Instruction */}
      <View style={styles.instructionBox}>
        <Text style={styles.instructionIcon}>📋</Text>
        <Text style={styles.instructionText}>
          Une photo du chantier est requise pour valider cette tâche.
          Elle sera archivée dans le dossier projet.
        </Text>
      </View>

      {/* Photo area */}
      {photoUri ? (
        <View style={styles.photoPreviewContainer}>
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          <View style={styles.photoOverlay}>
            <TouchableOpacity
              style={styles.retakeBtn}
              onPress={() => setPhotoUri(null)}
            >
              <Text style={styles.retakeTxt}>↩ Reprendre</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.photoDashedArea}
          onPress={handleCamera}
          activeOpacity={0.7}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.accent} size="large" />
          ) : (
            <>
              <View style={styles.cameraIconCircle}>
                <Text style={styles.cameraIcon}>📸</Text>
              </View>
              <Text style={styles.cameraLabel}>Prendre une photo du chantier</Text>
              <Text style={styles.cameraSubLabel}>pour validation</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Actions */}
      {!photoUri && (
        <AnimatedButton
          label="Choisir depuis la galerie"
          onPress={handleGallery}
          variant="ghost"
          size="md"
          icon="image"
          fullWidth
          disabled={loading}
        />
      )}

      {/* Confirm button */}
      <AnimatedButton
        label={photoUri ? 'Confirmer et clôturer la tâche' : 'Photo requise pour confirmer'}
        onPress={handleConfirm}
        variant="teal"
        size="lg"
        icon={photoUri ? 'check-circle' : 'camera'}
        fullWidth
        premium
        disabled={!photoUri}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingBottom: 40,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  headerSite: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeTxt: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  instructionBox: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  instructionIcon: {
    fontSize: 16,
  },
  instructionText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  photoDashedArea: {
    height: 220,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.accentBorder,
    borderRadius: Radius.lg,
    backgroundColor: Colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  cameraIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(249,115,22,0.1)',
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 32,
  },
  cameraLabel: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  cameraSubLabel: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  photoPreviewContainer: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  retakeBtn: {
    backgroundColor: 'rgba(9,9,11,0.85)',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retakeTxt: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});

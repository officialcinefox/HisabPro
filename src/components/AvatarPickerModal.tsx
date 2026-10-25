import React, { useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { AVATAR_OPTIONS, AvatarOption } from '../utils/avatars';

interface AvatarPickerModalProps {
  visible: boolean;
  selectedAvatarId?: string | null;
  onSelect: (avatarId: string) => void;
  onClose: () => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  visible,
  selectedAvatarId,
  onSelect,
  onClose,
}) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'all' | 'male' | 'female'>('all');

  const filteredAvatars = AVATAR_OPTIONS.filter((a) => {
    if (activeTab === 'all') return true;
    return a.gender === activeTab;
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              {/* Header */}
              <View style={styles.headerRow}>
                <View>
                  <Text style={[styles.title, { color: colors.textPrimary }]}>
                    Choose 3D Character
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Select your merchant profile avatar
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={[
                    styles.closeBtn,
                    { backgroundColor: colors.cardElevated, borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Gender Filter Tabs */}
              <View
                style={[
                  styles.filterRow,
                  { backgroundColor: colors.cardElevated, borderColor: colors.border },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('all')}
                  style={[
                    styles.filterTab,
                    activeTab === 'all' && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      {
                        color: activeTab === 'all' ? '#0B0F11' : colors.textSecondary,
                        fontWeight: activeTab === 'all' ? '700' : '500',
                      },
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('male')}
                  style={[
                    styles.filterTab,
                    activeTab === 'male' && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      {
                        color: activeTab === 'male' ? '#0B0F11' : colors.textSecondary,
                        fontWeight: activeTab === 'male' ? '700' : '500',
                      },
                    ]}
                  >
                    Male 👦
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('female')}
                  style={[
                    styles.filterTab,
                    activeTab === 'female' && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      {
                        color: activeTab === 'female' ? '#0B0F11' : colors.textSecondary,
                        fontWeight: activeTab === 'female' ? '700' : '500',
                      },
                    ]}
                  >
                    Female 👧
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Avatar Grid */}
              <View style={styles.grid}>
                {filteredAvatars.map((item: AvatarOption) => {
                  const isSelected = (selectedAvatarId || 'male1') === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        onSelect(item.id);
                        onClose();
                      }}
                      style={[
                        styles.avatarItem,
                        {
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected
                            ? 'rgba(255, 122, 0, 0.12)'
                            : colors.cardElevated,
                        },
                      ]}
                    >
                      <View style={styles.imageContainer}>
                        <Image source={item.source} style={styles.avatarImg} />
                        {isSelected && (
                          <View
                            style={[
                              styles.checkBadge,
                              { backgroundColor: colors.primary },
                            ]}
                          >
                            <Ionicons name="checkmark" size={12} color="#0B0F11" />
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.avatarName,
                          {
                            color: isSelected ? colors.primary : colors.textPrimary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  filterRow: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
  filterTabText: {
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  avatarItem: {
    width: '47%',
    borderRadius: 14,
    borderWidth: 2,
    padding: 12,
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
  },
  avatarImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0B0F11',
  },
  avatarName: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
});

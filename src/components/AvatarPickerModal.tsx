import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
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
  const [activeTab, setActiveTab] = useState<'all' | 'male' | 'female' | '3d'>('all');

  const filteredAvatars = AVATAR_OPTIONS.filter((a) => {
    if (activeTab === 'all') return true;
    if (activeTab === '3d') return a.category === '3d';
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
                    Choose Avatar ✨
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Pick your personalized profile look
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

              {/* Filter Tabs */}
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

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('3d')}
                  style={[
                    styles.filterTab,
                    activeTab === '3d' && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      {
                        color: activeTab === '3d' ? '#0B0F11' : colors.textSecondary,
                        fontWeight: activeTab === '3d' ? '700' : '500',
                      },
                    ]}
                  >
                    3D 🌟
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Avatar Grid (Scrollable) */}
              <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.grid}
                showsVerticalScrollIndicator={false}
              >
                {filteredAvatars.map((item: AvatarOption) => {
                  const isSelected = (selectedAvatarId || 'abhishek') === item.id;
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
                            ? 'rgba(255, 122, 0, 0.14)'
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
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '80%',
    borderRadius: 24,
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
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  filterRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  filterTabText: {
    fontSize: 12,
  },
  scrollArea: {
    maxHeight: 340,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  avatarItem: {
    width: '30.5%',
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: 62,
    height: 62,
    borderRadius: 31,
    overflow: 'hidden',
  },
  avatarImg: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0B0F11',
  },
  avatarName: {
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },
});

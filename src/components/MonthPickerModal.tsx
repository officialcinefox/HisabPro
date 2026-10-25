import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface MonthPickerModalProps {
  visible: boolean;
  selectedYear: number;
  selectedMonth: number; // 0-indexed (0 = Jan, 11 = Dec)
  onSelect: (year: number, month: number) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MONTH_FULL_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MonthPickerModal: React.FC<MonthPickerModalProps> = ({
  visible,
  selectedYear,
  selectedMonth,
  onSelect,
  onClose,
}) => {
  const { colors } = useTheme();
  const [viewYear, setViewYear] = useState(selectedYear);

  const now = new Date();
  const currentRealYear = now.getFullYear();
  const currentRealMonth = now.getMonth();

  const handlePrevYear = () => {
    setViewYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    setViewYear((prev) => prev + 1);
  };

  const handleResetToCurrent = () => {
    onSelect(currentRealYear, currentRealMonth);
    setViewYear(currentRealYear);
    onClose();
  };

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
              {/* Top Header */}
              <View style={styles.headerRow}>
                <View>
                  <Text style={[styles.title, { color: colors.textPrimary }]}>
                    Select Month & Year 📅
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Filter your expenses and budget records
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

              {/* Year Navigation Row */}
              <View
                style={[
                  styles.yearRow,
                  { backgroundColor: colors.cardElevated, borderColor: colors.border },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handlePrevYear}
                  style={styles.yearNavBtn}
                >
                  <Ionicons name="chevron-back" size={20} color={colors.primary} />
                </TouchableOpacity>

                <Text style={[styles.yearText, { color: colors.textPrimary }]}>
                  {viewYear}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleNextYear}
                  style={styles.yearNavBtn}
                >
                  <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {/* 12 Months Grid */}
              <View style={styles.monthGrid}>
                {MONTH_NAMES.map((name, index) => {
                  const isSelected =
                    viewYear === selectedYear && index === selectedMonth;
                  const isCurrentRealMonth =
                    viewYear === currentRealYear && index === currentRealMonth;

                  return (
                    <TouchableOpacity
                      key={name}
                      activeOpacity={0.75}
                      onPress={() => {
                        onSelect(viewYear, index);
                        onClose();
                      }}
                      style={[
                        styles.monthCell,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : colors.cardElevated,
                          borderColor: isSelected
                            ? colors.primary
                            : isCurrentRealMonth
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.monthCellText,
                          {
                            color: isSelected ? '#0B0F11' : colors.textPrimary,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                      >
                        {name}
                      </Text>
                      {isCurrentRealMonth && !isSelected && (
                        <View
                          style={[
                            styles.currentDot,
                            { backgroundColor: colors.primary },
                          ]}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Footer Quick Reset */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleResetToCurrent}
                style={[
                  styles.currentMonthBtn,
                  { backgroundColor: colors.cardElevated, borderColor: colors.border },
                ]}
              >
                <Ionicons name="today-outline" size={16} color={colors.primary} />
                <Text style={[styles.currentMonthBtnText, { color: colors.primary }]}>
                  Reset to Current Month ({MONTH_NAMES[currentRealMonth]} {currentRealYear})
                </Text>
              </TouchableOpacity>
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
    maxWidth: 380,
    borderRadius: 22,
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
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  yearNavBtn: {
    padding: 6,
  },
  yearText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthCell: {
    width: '23%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  monthCellText: {
    fontSize: 14,
  },
  currentDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  currentMonthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  currentMonthBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

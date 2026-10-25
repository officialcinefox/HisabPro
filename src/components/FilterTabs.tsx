import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export type FilterValue = 'all' | 'lena_hai' | 'dena_hai' | 'settled';

interface FilterOption {
  label: string;
  value: FilterValue;
  count?: number;
  iconName?: keyof typeof Ionicons.glyphMap;
}

interface FilterTabsProps {
  options: FilterOption[];
  selectedValue: FilterValue;
  onSelect: (value: FilterValue) => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  options,
  selectedValue,
  onSelect,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.7}
              onPress={() => onSelect(option.value)}
              style={[
                styles.tab,
                {
                  backgroundColor: isSelected ? colors.primary : colors.cardElevated,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              {option.iconName && (
                <Ionicons
                  name={option.iconName}
                  size={14}
                  color={isSelected ? '#0B0F11' : colors.textSecondary}
                  style={{ marginRight: 5 }}
                />
              )}
              <Text
                style={[
                  styles.label,
                  {
                    color: isSelected ? '#0B0F11' : colors.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {option.label}
              </Text>
              {typeof option.count === 'number' ? (
                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor: isSelected ? 'rgba(0,0,0,0.2)' : colors.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      { color: isSelected ? '#0B0F11' : colors.textSecondary },
                    ]}
                  >
                    {option.count}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerCard } from '../../components/CustomerCard';
import { EmptyState } from '../../components/EmptyState';
import { FilterTabs, FilterValue } from '../../components/FilterTabs';
import { FloatingActionButton } from '../../components/FloatingActionButton';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { SearchBar } from '../../components/SearchBar';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { CustomerWithBalance, RootStackParamList } from '../../types';

type SortOption = 'highest_balance' | 'most_recent';

export const CustomersListScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { customers, isLoading, refreshData } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterValue>('all');
  const [sortBy, setSortBy] = useState<SortOption>('highest_balance');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Filter Counts
  const counts = useMemo(() => {
    let lenaCount = 0;
    let denaCount = 0;
    let settledCount = 0;
    for (const c of customers) {
      if (c.status === 'lena_hai') lenaCount++;
      else if (c.status === 'dena_hai') denaCount++;
      else settledCount++;
    }
    return {
      all: customers.length,
      lena: lenaCount,
      dena: denaCount,
      settled: settledCount,
    };
  }, [customers]);

  const filterOptions = [
    { label: 'All', value: 'all' as FilterValue, count: counts.all },
    { label: 'Lena Hai', value: 'lena_hai' as FilterValue, count: counts.lena },
    { label: 'Dena Hai', value: 'dena_hai' as FilterValue, count: counts.dena },
    { label: 'Settled', value: 'settled' as FilterValue, count: counts.settled },
  ];

  const filteredAndSortedCustomers = useMemo(() => {
    let list = [...customers];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q))
      );
    }

    // Status filter
    if (filter !== 'all') {
      list = list.filter((c) => c.status === filter);
    }

    // Sort
    if (sortBy === 'highest_balance') {
      list.sort((a, b) => b.displayAmount - a.displayAmount);
    } else if (sortBy === 'most_recent') {
      list.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return list;
  }, [customers, searchQuery, filter, sortBy]);

  if (isLoading && !refreshing) {
    return <LoadingOverlay message="Loading customer ledgers..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by customer name or phone..."
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSortModalVisible(true)}
            style={[
              styles.sortBtn,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="swap-vertical" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <FilterTabs
          options={filterOptions}
          selectedValue={filter}
          onSelect={setFilter}
        />
      </View>

      <FlatList
        data={filteredAndSortedCustomers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onPress={() =>
              navigation.navigate('CustomerDetail', { customerId: item.id })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            iconName="people-outline"
            title={searchQuery ? 'No Matching Customers' : 'No Customers Found'}
            description={
              searchQuery
                ? 'Try a different customer name or phone number.'
                : 'Tap "+ Add Customer" below to open a new ledger account.'
            }
          />
        }
      />

      <FloatingActionButton
        label="Add Customer"
        iconName="person-add"
        onPress={() => navigation.navigate('AddCustomer')}
      />

      {/* Sort Modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSortModalVisible(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalContent,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  Sort Customers By
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setSortBy('highest_balance');
                    setSortModalVisible(false);
                  }}
                  style={[
                    styles.sortOption,
                    {
                      borderColor:
                        sortBy === 'highest_balance' ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      {
                        color:
                          sortBy === 'highest_balance'
                            ? colors.primary
                            : colors.textPrimary,
                        fontWeight: sortBy === 'highest_balance' ? '700' : '500',
                      },
                    ]}
                  >
                    Highest Outstanding Balance
                  </Text>
                  {sortBy === 'highest_balance' ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  ) : null}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setSortBy('most_recent');
                    setSortModalVisible(false);
                  }}
                  style={[
                    styles.sortOption,
                    {
                      borderColor:
                        sortBy === 'most_recent' ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      {
                        color:
                          sortBy === 'most_recent'
                            ? colors.primary
                            : colors.textPrimary,
                        fontWeight: sortBy === 'most_recent' ? '700' : '500',
                      },
                    ]}
                  >
                    Most Recently Added
                  </Text>
                  {sortBy === 'most_recent' ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  ) : null}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  sortOptionText: {
    fontSize: 14,
  },
});

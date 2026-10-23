export interface ThemeColors {
  primary: string;
  primaryLight: string;
  background: string;
  card: string;
  cardElevated: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  inputBackground: string;
  inputBorder: string;
  positive: string;      // Lena Hai (#22C55E)
  positiveLight: string; // Background tint
  negative: string;      // Dena Hai (#EF4444)
  negativeLight: string; // Background tint
  settled: string;       // Settled (#64748B)
  settledLight: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
  statusBar: 'light' | 'dark';
  modalOverlay: string;
  divider: string;
}

export const darkColors: ThemeColors = {
  primary: '#FF7A00',
  primaryLight: '#FF9F3D',
  background: '#0B0F11',
  card: '#1A1D24',
  cardElevated: '#252A33',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#2A303C',
  inputBackground: '#13171F',
  inputBorder: '#2E3545',
  positive: '#22C55E',
  positiveLight: 'rgba(34, 197, 94, 0.15)',
  negative: '#EF4444',
  negativeLight: 'rgba(239, 68, 68, 0.15)',
  settled: '#64748B',
  settledLight: 'rgba(100, 116, 139, 0.15)',
  tabBarBackground: '#12151B',
  tabBarBorder: '#222834',
  tabBarActive: '#FF7A00',
  tabBarInactive: '#64748B',
  statusBar: 'light',
  modalOverlay: 'rgba(0, 0, 0, 0.75)',
  divider: '#1E232E',
};

export const lightColors: ThemeColors = {
  primary: '#FF7A00',
  primaryLight: '#FF9F3D',
  background: '#F6F8FB',
  card: '#FFFFFF',
  cardElevated: '#EEF2F6',
  textPrimary: '#101828',
  textSecondary: '#667085',
  border: '#E2E8F0',
  inputBackground: '#F8FAFC',
  inputBorder: '#D0D5DD',
  positive: '#16A34A',
  positiveLight: 'rgba(22, 163, 74, 0.12)',
  negative: '#DC2626',
  negativeLight: 'rgba(220, 38, 38, 0.12)',
  settled: '#64748B',
  settledLight: 'rgba(100, 116, 139, 0.12)',
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabBarActive: '#FF7A00',
  tabBarInactive: '#94A3B8',
  statusBar: 'dark',
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
  divider: '#EAECF0',
};

export const expenseCategoryColors: Record<string, string> = {
  Food: '#F59E0B',     // Amber
  Travel: '#3B82F6',   // Blue
  Shopping: '#EC4899', // Pink
  Bills: '#8B5CF6',    // Purple
  Other: '#06B6D4',    // Cyan
};

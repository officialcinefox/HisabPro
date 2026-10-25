import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AvatarPickerModal } from '../../components/AvatarPickerModal';
import { BottomNavBar } from '../../components/BottomNavBar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  adminService,
  AdminStats,
  AdminUserProfile,
  AppFeatureConfig,
  DEFAULT_FEATURE_CONFIG,
} from '../../services/adminService';
import { RootStackParamList } from '../../types';
import { getAvatarSource } from '../../utils/avatars';

interface AdminDashboardScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AdminDashboard'>;
}

type TabKey = 'features' | 'announcement' | 'security' | 'branding' | 'users';

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const { colors, isDark } = useTheme();
  const { profile, user, updateAvatar } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabKey>('features');

  // Loading & Saving States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // App Feature Configuration State
  const [config, setConfig] = useState<AppFeatureConfig>(DEFAULT_FEATURE_CONFIG);

  // Platform Users & Stats
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 1,
    totalCustomers: 0,
    totalTransactions: 0,
    totalVolume: 0,
    activeToday: 1,
  });
  const [users, setUsers] = useState<AdminUserProfile[]>([]);

  // Modals
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [announcementModalVisible, setAnnouncementModalVisible] = useState(false);
  const [brandingModalVisible, setBrandingModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [maintenanceModalVisible, setMaintenanceModalVisible] = useState(false);

  // Temporary Edit Form States
  const [tempTemplate, setTempTemplate] = useState('');
  const [tempAnnTitle, setTempAnnTitle] = useState('');
  const [tempAnnText, setTempAnnText] = useState('');
  const [tempAnnType, setTempAnnType] = useState<'info' | 'success' | 'warning'>('info');
  const [tempBrandName, setTempBrandName] = useState('');
  const [tempTagline, setTempTagline] = useState('');
  const [tempPhone, setTempPhone] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [tempUpiId, setTempUpiId] = useState('');
  const [tempMerchantName, setTempMerchantName] = useState('');
  const [tempMaintMsg, setTempMaintMsg] = useState('');

  // Load initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [featConfig, platformStats, allUsers] = await Promise.all([
        adminService.getFeatureConfig(),
        adminService.getPlatformStats(),
        adminService.getAllUsers(),
      ]);
      setConfig(featConfig);
      setStats(platformStats);
      setUsers(allUsers);
    } catch (e) {
      console.warn('Failed to load admin settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Config to storage & notify
  const handleSaveConfig = async (updatedConfig: AppFeatureConfig, successMsg = 'Settings saved successfully!') => {
    setSaving(true);
    setConfig(updatedConfig);
    const res = await adminService.saveFeatureConfig(updatedConfig);
    setSaving(false);
    if (res.success) {
      setSaveSuccessMessage(successMsg);
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } else {
      Alert.alert('Error', res.error || 'Failed to save settings');
    }
  };

  // Toggle helper
  const toggleFeature = (key: keyof AppFeatureConfig) => {
    const updated = {
      ...config,
      [key]: !config[key],
    };
    handleSaveConfig(updated, `${String(key)} updated`);
  };

  // Handlers for modals
  const openTemplateModal = () => {
    setTempTemplate(config.whatsappTemplate);
    setTemplateModalVisible(true);
  };
  const saveTemplateModal = () => {
    handleSaveConfig({ ...config, whatsappTemplate: tempTemplate });
    setTemplateModalVisible(false);
  };

  const openAnnouncementModal = () => {
    setTempAnnTitle(config.announcementTitle);
    setTempAnnText(config.announcementText);
    setTempAnnType(config.announcementType);
    setAnnouncementModalVisible(true);
  };
  const saveAnnouncementModal = () => {
    handleSaveConfig({
      ...config,
      announcementTitle: tempAnnTitle,
      announcementText: tempAnnText,
      announcementType: tempAnnType,
    });
    setAnnouncementModalVisible(false);
  };

  const openBrandingModal = () => {
    setTempBrandName(config.brandName);
    setTempTagline(config.tagline);
    setTempPhone(config.supportPhone);
    setTempEmail(config.supportEmail);
    setBrandingModalVisible(true);
  };
  const saveBrandingModal = () => {
    handleSaveConfig({
      ...config,
      brandName: tempBrandName,
      tagline: tempTagline,
      supportPhone: tempPhone,
      supportEmail: tempEmail,
    });
    setBrandingModalVisible(false);
  };

  const openPaymentModal = () => {
    setTempUpiId(config.defaultUpiId);
    setTempMerchantName(config.defaultMerchantName);
    setPaymentModalVisible(true);
  };
  const savePaymentModal = () => {
    handleSaveConfig({
      ...config,
      defaultUpiId: tempUpiId,
      defaultMerchantName: tempMerchantName,
    });
    setPaymentModalVisible(false);
  };

  const openMaintenanceModal = () => {
    setTempMaintMsg(config.maintenanceMessage);
    setMaintenanceModalVisible(true);
  };
  const saveMaintenanceModal = () => {
    handleSaveConfig({
      ...config,
      maintenanceMessage: tempMaintMsg,
    });
    setMaintenanceModalVisible(false);
  };

  const handleResetDefaults = () => {
    Alert.alert(
      'Reset All Feature Settings',
      'Are you sure you want to restore all app feature settings to original defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset to Defaults',
          style: 'destructive',
          onPress: () => handleSaveConfig(DEFAULT_FEATURE_CONFIG, 'Restored to defaults!'),
        },
      ]
    );
  };

  const handleToggleUserRole = async (targetUser: AdminUserProfile) => {
    if (targetUser.email === 'abhidagar6319@gmail.com') {
      Alert.alert('Protected', 'Primary Super Admin account role cannot be changed.');
      return;
    }
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const res = await adminService.updateUserRole(targetUser.id, newRole);
    if (!res.error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
      Alert.alert('Success', `Updated ${targetUser.display_name || targetUser.email} to ${newRole}`);
    } else {
      Alert.alert('Error', res.error);
    }
  };

  const handleToggleUserStatus = async (targetUser: AdminUserProfile) => {
    if (targetUser.email === 'abhidagar6319@gmail.com') {
      Alert.alert('Protected', 'Primary Super Admin cannot be blocked.');
      return;
    }
    const newStatus = targetUser.status === 'blocked' ? 'active' : 'blocked';
    const res = await adminService.updateUserStatus(targetUser.id, newStatus);
    if (!res.error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, status: newStatus } : u))
      );
      Alert.alert('Success', `User status changed to ${newStatus}`);
    } else {
      Alert.alert('Error', res.error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0B0F11' : '#F4F6F8' }]}>
      {/* Top Header Bar */}
      <View style={[styles.topHeader, { backgroundColor: isDark ? '#11161A' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
        <View style={styles.topHeaderLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={22} color={isDark ? '#F1F5F9' : '#0F172A'} />
          </TouchableOpacity>
          <View style={styles.brandTitleCol}>
            <View style={styles.brandTitleRow}>
              <Text style={[styles.brandTitleText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                Hisab<Text style={{ color: '#FF7A00' }}>Pro</Text>
              </Text>
              <View style={styles.adminCrownBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#FF7A00" />
                <Text style={styles.adminCrownText}>FEATURE CONTROL</Text>
              </View>
            </View>
            <Text style={[styles.brandSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Master Application Settings & Feature Management
            </Text>
          </View>
        </View>

        <View style={styles.topHeaderRight}>
          {saveSuccessMessage && (
            <View style={styles.savedToastBadge}>
              <Ionicons name="checkmark-circle" size={15} color="#10B981" />
              <Text style={styles.savedToastText}>{saveSuccessMessage}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.refreshBtn, { backgroundColor: isDark ? '#1C242B' : '#E2E8F0' }]}
            onPress={loadData}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FF7A00" />
            ) : (
              <Ionicons name="refresh" size={18} color={isDark ? '#CBD5E1' : '#334155'} />
            )}
          </TouchableOpacity>

          <View style={styles.adminProfileChip}>
            <View style={styles.adminChipAvatar}>
              <Text style={styles.adminChipInitial}>A</Text>
            </View>
            {isDesktop && (
              <View>
                <Text style={[styles.adminChipName, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>
                  Abhishek Dagar
                </Text>
                <Text style={styles.adminChipEmail}>abhidagar6319@gmail.com</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={styles.mainScrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentWrapper, { maxWidth: isDesktop ? 1200 : '100%' }]}>

          {/* System Health / Status Banner */}
          <View style={[styles.healthBanner, { backgroundColor: isDark ? '#141B20' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
            <View style={styles.healthItem}>
              <View style={[styles.healthDot, { backgroundColor: '#10B981' }]} />
              <View>
                <Text style={[styles.healthLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Engine Status</Text>
                <Text style={[styles.healthValue, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>ONLINE • Active</Text>
              </View>
            </View>

            <View style={styles.healthDivider} />

            <View style={styles.healthItem}>
              <Ionicons name="cloud-done-outline" size={18} color="#FF7A00" />
              <View style={{ marginLeft: 8 }}>
                <Text style={[styles.healthLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Supabase Cloud</Text>
                <Text style={[styles.healthValue, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>Connected (Realtime)</Text>
              </View>
            </View>

            <View style={styles.healthDivider} />

            <View style={styles.healthItem}>
              <Ionicons name="people-outline" size={18} color="#3B82F6" />
              <View style={{ marginLeft: 8 }}>
                <Text style={[styles.healthLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Platform Users</Text>
                <Text style={[styles.healthValue, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>{stats.totalUsers} Registered</Text>
              </View>
            </View>

            <View style={styles.healthDivider} />

            <View style={styles.healthItem}>
              <Ionicons name="phone-portrait-outline" size={18} color="#8B5CF6" />
              <View style={{ marginLeft: 8 }}>
                <Text style={[styles.healthLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>App Version</Text>
                <Text style={[styles.healthValue, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>v{config.appVersion} (Latest)</Text>
              </View>
            </View>
          </View>

          {/* Navigation Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
          >
            {[
              { key: 'features', label: 'Feature Switches', icon: 'toggle-outline' },
              { key: 'announcement', label: 'In-App Announcement', icon: 'megaphone-outline' },
              { key: 'security', label: 'Security & Maintenance', icon: 'shield-outline' },
              { key: 'branding', label: 'Brand & Organization', icon: 'business-outline' },
              { key: 'users', label: 'Users & Admins', icon: 'people-outline' },
            ].map((tab) => {
              const active = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.tabButton,
                    active && styles.tabButtonActive,
                    {
                      backgroundColor: active
                        ? '#FF7A00'
                        : isDark
                        ? '#161D22'
                        : '#FFFFFF',
                      borderColor: active
                        ? '#FF7A00'
                        : isDark
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(0,0,0,0.08)',
                    },
                  ]}
                  onPress={() => setActiveTab(tab.key as TabKey)}
                >
                  <Ionicons
                    name={tab.icon as any}
                    size={16}
                    color={active ? '#0B0F11' : isDark ? '#94A3B8' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.tabButtonText,
                      { color: active ? '#0B0F11' : isDark ? '#E2E8F0' : '#334155', fontWeight: active ? '800' : '600' },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* TAB 1: FEATURE SWITCHES */}
          {activeTab === 'features' && (
            <View style={styles.gridContainer}>
              {/* WhatsApp Engine Card */}
              <View style={[styles.featureCard, { backgroundColor: isDark ? '#141B20' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIconBox, { backgroundColor: 'rgba(37, 211, 102, 0.15)' }]}>
                    <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      WhatsApp Share & Reminder
                    </Text>
                    <Text style={[styles.cardDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Manage customer payment reminders & direct WhatsApp statement dispatch
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.switchRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.switchTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      Enable WhatsApp Actions
                    </Text>
                    <Text style={[styles.switchSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Allows merchants to trigger 1-tap reminders & reports via WhatsApp
                    </Text>
                  </View>
                  <Switch
                    value={config.whatsappRemindersEnabled}
                    onValueChange={() => toggleFeature('whatsappRemindersEnabled')}
                    trackColor={{ false: '#334155', true: '#25D366' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.switchRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.switchTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      Direct Payment Reminder Mode
                    </Text>
                    <Text style={[styles.switchSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      ON: Sends formatted payment balance text directly (no download needed)
                    </Text>
                  </View>
                  <Switch
                    value={config.whatsappDirectShare}
                    onValueChange={() => toggleFeature('whatsappDirectShare')}
                    trackColor={{ false: '#334155', true: '#FF7A00' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.outlineActionBtn, { borderColor: '#25D366' }]}
                  onPress={openTemplateModal}
                >
                  <Ionicons name="pencil-outline" size={16} color="#25D366" />
                  <Text style={[styles.outlineActionBtnText, { color: '#25D366' }]}>
                    Customize WhatsApp Reminder Template
                  </Text>
                </TouchableOpacity>
              </View>

              {/* PDF Engine Card */}
              <View style={[styles.featureCard, { backgroundColor: isDark ? '#141B20' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                    <Ionicons name="document-text" size={22} color="#EF4444" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      PDF Statements & Ledger Engine
                    </Text>
                    <Text style={[styles.cardDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Controls high-res PDF generation, layout headers, and account balance summaries
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.switchRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.switchTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      Allow PDF Generation & Downloads
                    </Text>
                    <Text style={[styles.switchSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Global switch to enable or disable PDF exports across all platforms
                    </Text>
                  </View>
                  <Switch
                    value={config.pdfGenerationEnabled}
                    onValueChange={() => toggleFeature('pdfGenerationEnabled')}
                    trackColor={{ false: '#334155', true: '#EF4444' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.switchRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.switchTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      Show Business Logo on PDF
                    </Text>
                    <Text style={[styles.switchSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Renders HisabPro official header badge and company branding
                    </Text>
                  </View>
                  <Switch
                    value={config.pdfShowLogo}
                    onValueChange={() => toggleFeature('pdfShowLogo')}
                    trackColor={{ false: '#334155', true: '#FF7A00' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.switchRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.switchTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      Include UPI Payment QR Code in PDF
                    </Text>
                    <Text style={[styles.switchSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Embeds instant scan-to-pay QR code for customer payments
                    </Text>
                  </View>
                  <Switch
                    value={config.pdfShowUpiQr}
                    onValueChange={() => toggleFeature('pdfShowUpiQr')}
                    trackColor={{ false: '#334155', true: '#10B981' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.switchRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.switchTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      HisabPro Official Watermark & Verification
                    </Text>
                    <Text style={[styles.switchSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Adds "Generated via HisabPro" verified trust footer
                    </Text>
                  </View>
                  <Switch
                    value={config.pdfShowWatermark}
                    onValueChange={() => toggleFeature('pdfShowWatermark')}
                    trackColor={{ false: '#334155', true: '#FF7A00' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>

              {/* UPI Payments Card */}
              <View style={[styles.featureCard, { backgroundColor: isDark ? '#141B20' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                    <Ionicons name="card" size={22} color="#3B82F6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      UPI Payment Gateway & QR
                    </Text>
                    <Text style={[styles.cardDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Set default merchant collection UPI ID, payee name & collection links
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.switchRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.switchTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      Enable UPI Collections
                    </Text>
                    <Text style={[styles.switchSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Allows customers to scan UPI QR or click to pay via GPay, PhonePe, Paytm
                    </Text>
                  </View>
                  <Switch
                    value={config.upiPaymentsEnabled}
                    onValueChange={() => toggleFeature('upiPaymentsEnabled')}
                    trackColor={{ false: '#334155', true: '#3B82F6' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={[styles.infoDisplayBox, { backgroundColor: isDark ? '#1C242B' : '#F1F5F9' }]}>
                  <View style={styles.infoDisplayRow}>
                    <Text style={[styles.infoDisplayKey, { color: isDark ? '#94A3B8' : '#64748B' }]}>Merchant UPI ID:</Text>
                    <Text style={[styles.infoDisplayVal, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>{config.defaultUpiId}</Text>
                  </View>
                  <View style={styles.infoDisplayRow}>
                    <Text style={[styles.infoDisplayKey, { color: isDark ? '#94A3B8' : '#64748B' }]}>Payee Name:</Text>
                    <Text style={[styles.infoDisplayVal, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>{config.defaultMerchantName}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.outlineActionBtn, { borderColor: '#3B82F6' }]}
                  onPress={openPaymentModal}
                >
                  <Ionicons name="settings-outline" size={16} color="#3B82F6" />
                  <Text style={[styles.outlineActionBtnText, { color: '#3B82F6' }]}>
                    Edit UPI ID & Payee Settings
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 3D Pixar Avatars Card */}
              <View style={[styles.featureCard, { backgroundColor: isDark ? '#141B20' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                    <Ionicons name="happy" size={22} color="#F59E0B" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      3D Avatars & Profile Media
                    </Text>
                    <Text style={[styles.cardDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Exclusive 3D Pixar cartoon avatar suite & user image customizations
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.switchRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.switchTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      3D Pixar Avatars Suite
                    </Text>
                    <Text style={[styles.switchSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Allows users to choose from modern 3D Disney/Pixar styled portraits
                    </Text>
                  </View>
                  <Switch
                    value={config.avatars3dEnabled}
                    onValueChange={() => toggleFeature('avatars3dEnabled')}
                    trackColor={{ false: '#334155', true: '#F59E0B' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.switchRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.switchTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      Allow Custom Photo Uploads
                    </Text>
                    <Text style={[styles.switchSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Users can upload their personal photo from camera/gallery
                    </Text>
                  </View>
                  <Switch
                    value={config.allowCustomAvatarUpload}
                    onValueChange={() => toggleFeature('allowCustomAvatarUpload')}
                    trackColor={{ false: '#334155', true: '#FF7A00' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.outlineActionBtn, { borderColor: '#F59E0B' }]}
                  onPress={() => setAvatarPickerVisible(true)}
                >
                  <Ionicons name="images-outline" size={16} color="#F59E0B" />
                  <Text style={[styles.outlineActionBtnText, { color: '#F59E0B' }]}>
                    Preview & Test 3D Avatar Gallery
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* TAB 2: IN-APP ANNOUNCEMENT */}
          {activeTab === 'announcement' && (
            <View style={styles.singleColContainer}>
              <View style={[styles.featureCard, { backgroundColor: isDark ? '#141B20' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                    <Ionicons name="megaphone" size={22} color="#3B82F6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      Broadcast Announcement Banner
                    </Text>
                    <Text style={[styles.cardDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Display alerts, system updates, new feature notices to all app users in real-time
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.switchRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.switchTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      Activate Global Banner
                    </Text>
                    <Text style={[styles.switchSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      When active, shows the notice card at the top of the user's home screen
                    </Text>
                  </View>
                  <Switch
                    value={config.announcementActive}
                    onValueChange={() => toggleFeature('announcementActive')}
                    trackColor={{ false: '#334155', true: '#3B82F6' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* Live Preview Box */}
                <Text style={[styles.sectionSubtitle, { color: isDark ? '#94A3B8' : '#64748B', marginTop: 14 }]}>
                  LIVE USER PREVIEW:
                </Text>
                <View
                  style={[
                    styles.announcementPreviewBox,
                    config.announcementType === 'info' && { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: '#3B82F6' },
                    config.announcementType === 'success' && { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10B981' },
                    config.announcementType === 'warning' && { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: '#F59E0B' },
                  ]}
                >
                  <View style={styles.annPreviewHeader}>
                    <Ionicons
                      name={
                        config.announcementType === 'info'
                          ? 'information-circle'
                          : config.announcementType === 'success'
                          ? 'checkmark-circle'
                          : 'warning'
                      }
                      size={20}
                      color={
                        config.announcementType === 'info'
                          ? '#3B82F6'
                          : config.announcementType === 'success'
                          ? '#10B981'
                          : '#F59E0B'
                      }
                    />
                    <Text
                      style={[
                        styles.annPreviewTitle,
                        {
                          color:
                            config.announcementType === 'info'
                              ? '#3B82F6'
                              : config.announcementType === 'success'
                              ? '#10B981'
                              : '#F59E0B',
                        },
                      ]}
                    >
                      {config.announcementTitle}
                    </Text>
                  </View>
                  <Text style={[styles.annPreviewText, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>
                    {config.announcementText}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.primaryActionBtn, { backgroundColor: '#3B82F6' }]}
                  onPress={openAnnouncementModal}
                >
                  <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryActionBtnText}>Edit Announcement Text & Color</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* TAB 3: SECURITY & MAINTENANCE */}
          {activeTab === 'security' && (
            <View style={styles.gridContainer}>
              {/* Maintenance Mode Card */}
              <View style={[styles.featureCard, { backgroundColor: isDark ? '#141B20' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                    <Ionicons name="construct" size={22} color="#EF4444" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      Maintenance Lockdown
                    </Text>
                    <Text style={[styles.cardDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Take the app offline for routine database upgrades or server updates
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.switchRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.switchTitle, { color: '#EF4444' }]}>
                      Lock App for Maintenance
                    </Text>
                    <Text style={[styles.switchSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Normal users will see a maintenance screen. Admins still have full access.
                    </Text>
                  </View>
                  <Switch
                    value={config.maintenanceMode}
                    onValueChange={() => toggleFeature('maintenanceMode')}
                    trackColor={{ false: '#334155', true: '#EF4444' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.outlineActionBtn, { borderColor: '#EF4444' }]}
                  onPress={openMaintenanceModal}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color="#EF4444" />
                  <Text style={[styles.outlineActionBtnText, { color: '#EF4444' }]}>
                    Edit Maintenance Screen Message
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Version & Access Security */}
              <View style={[styles.featureCard, { backgroundColor: isDark ? '#141B20' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Ionicons name="shield-checkmark" size={22} color="#10B981" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      Access & App Locks
                    </Text>
                    <Text style={[styles.cardDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      User registration gate, biometric passcodes & force updates
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.switchRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.switchTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      Open New Registrations
                    </Text>
                    <Text style={[styles.switchSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Allows new users to sign up with mobile OTP / Email
                    </Text>
                  </View>
                  <Switch
                    value={config.allowNewRegistrations}
                    onValueChange={() => toggleFeature('allowNewRegistrations')}
                    trackColor={{ false: '#334155', true: '#10B981' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.switchRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.switchTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      Biometric App Lock Feature
                    </Text>
                    <Text style={[styles.switchSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Users can secure khata ledgers with Fingerprint / PIN
                    </Text>
                  </View>
                  <Switch
                    value={config.biometricLockEnabled}
                    onValueChange={() => toggleFeature('biometricLockEnabled')}
                    trackColor={{ false: '#334155', true: '#FF7A00' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.switchRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.switchTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      Force Minimum Version Check
                    </Text>
                    <Text style={[styles.switchSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Requires users to update if on version lower than v{config.minRequiredVersion}
                    </Text>
                  </View>
                  <Switch
                    value={config.forceUpdate}
                    onValueChange={() => toggleFeature('forceUpdate')}
                    trackColor={{ false: '#334155', true: '#EF4444' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            </View>
          )}

          {/* TAB 4: BRAND & ORGANIZATION */}
          {activeTab === 'branding' && (
            <View style={styles.singleColContainer}>
              <View style={[styles.featureCard, { backgroundColor: isDark ? '#141B20' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIconBox, { backgroundColor: 'rgba(255, 122, 0, 0.15)' }]}>
                    <Ionicons name="sparkles" size={22} color="#FF7A00" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      Brand Identity & Support Details
                    </Text>
                    <Text style={[styles.cardDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Customize company name, tagline, official support phone, and email across the entire app
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.brandInfoGrid}>
                  <View style={[styles.brandInfoItem, { backgroundColor: isDark ? '#1C242B' : '#F1F5F9' }]}>
                    <Text style={[styles.brandInfoKey, { color: isDark ? '#94A3B8' : '#64748B' }]}>Application Name</Text>
                    <Text style={[styles.brandInfoVal, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>{config.brandName}</Text>
                  </View>

                  <View style={[styles.brandInfoItem, { backgroundColor: isDark ? '#1C242B' : '#F1F5F9' }]}>
                    <Text style={[styles.brandInfoKey, { color: isDark ? '#94A3B8' : '#64748B' }]}>Brand Tagline</Text>
                    <Text style={[styles.brandInfoVal, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>{config.tagline}</Text>
                  </View>

                  <View style={[styles.brandInfoItem, { backgroundColor: isDark ? '#1C242B' : '#F1F5F9' }]}>
                    <Text style={[styles.brandInfoKey, { color: isDark ? '#94A3B8' : '#64748B' }]}>Support Phone / WhatsApp</Text>
                    <Text style={[styles.brandInfoVal, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>{config.supportPhone}</Text>
                  </View>

                  <View style={[styles.brandInfoItem, { backgroundColor: isDark ? '#1C242B' : '#F1F5F9' }]}>
                    <Text style={[styles.brandInfoKey, { color: isDark ? '#94A3B8' : '#64748B' }]}>Official Contact Email</Text>
                    <Text style={[styles.brandInfoVal, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>{config.supportEmail}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryActionBtn, { backgroundColor: '#FF7A00', marginTop: 18 }]}
                  onPress={openBrandingModal}
                >
                  <Ionicons name="pencil" size={18} color="#0B0F11" />
                  <Text style={[styles.primaryActionBtnText, { color: '#0B0F11' }]}>
                    Edit Brand & Support Details
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* TAB 5: USERS & ADMINS */}
          {activeTab === 'users' && (
            <View style={styles.singleColContainer}>
              <View style={[styles.featureCard, { backgroundColor: isDark ? '#141B20' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIconBox, { backgroundColor: 'rgba(255, 122, 0, 0.15)' }]}>
                    <Ionicons name="people" size={22} color="#FF7A00" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      Platform Accounts & Roles
                    </Text>
                    <Text style={[styles.cardDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      Manage authorized admin accounts, user access status, and platform members
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.userListCol}>
                  {users.map((item) => {
                    const isSuperAdmin = item.email === 'abhidagar6319@gmail.com';
                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.userCardItem,
                          {
                            backgroundColor: isDark ? '#1C242B' : '#F8FAFC',
                            borderColor: isSuperAdmin ? '#FF7A00' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
                          },
                        ]}
                      >
                        <View style={styles.userCardLeft}>
                          <View
                            style={[
                              styles.userAvatarBox,
                              { backgroundColor: isSuperAdmin ? '#FF7A00' : '#3B82F6' },
                            ]}
                          >
                            <Text style={styles.userAvatarText}>
                              {(item.display_name || item.email || 'U')[0].toUpperCase()}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <Text style={[styles.userNameText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                                {item.display_name || 'Registered User'}
                              </Text>
                              {isSuperAdmin ? (
                                <View style={styles.superAdminTag}>
                                  <Text style={styles.superAdminTagText}>👑 SUPER ADMIN</Text>
                                </View>
                              ) : item.role === 'admin' ? (
                                <View style={styles.adminTag}>
                                  <Text style={styles.adminTagText}>ADMIN</Text>
                                </View>
                              ) : null}
                            </View>
                            <Text style={[styles.userEmailText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                              {item.email || item.phone || 'No email provided'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.userCardRight}>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor: item.status === 'blocked' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                { color: item.status === 'blocked' ? '#EF4444' : '#10B981' },
                              ]}
                            >
                              {item.status === 'blocked' ? 'BLOCKED' : 'ACTIVE'}
                            </Text>
                          </View>

                          {!isSuperAdmin && (
                            <View style={{ flexDirection: 'row', gap: 6 }}>
                              <TouchableOpacity
                                style={[styles.userActionMiniBtn, { borderColor: '#3B82F6' }]}
                                onPress={() => handleToggleUserRole(item)}
                              >
                                <Text style={[styles.userActionMiniBtnText, { color: '#3B82F6' }]}>
                                  {item.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[
                                  styles.userActionMiniBtn,
                                  { borderColor: item.status === 'blocked' ? '#10B981' : '#EF4444' },
                                ]}
                                onPress={() => handleToggleUserStatus(item)}
                              >
                                <Text
                                  style={[
                                    styles.userActionMiniBtnText,
                                    { color: item.status === 'blocked' ? '#10B981' : '#EF4444' },
                                  ]}
                                >
                                  {item.status === 'blocked' ? 'Unblock' : 'Block'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {/* Quick System Tools Bottom Row */}
          <View style={[styles.quickToolsBox, { backgroundColor: isDark ? '#141B20' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
            <View style={styles.quickToolsLeft}>
              <Ionicons name="hardware-chip-outline" size={20} color="#FF7A00" />
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.quickToolsTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  System Maintenance & Global Reset
                </Text>
                <Text style={[styles.quickToolsSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Instantly synchronize settings with cloud storage or restore factory defaults
                </Text>
              </View>
            </View>
            <View style={styles.quickToolsRight}>
              <TouchableOpacity
                style={[styles.resetDefaultsBtn, { borderColor: 'rgba(239, 68, 68, 0.4)' }]}
                onPress={handleResetDefaults}
              >
                <Ionicons name="refresh-circle-outline" size={16} color="#EF4444" />
                <Text style={styles.resetDefaultsText}>Reset to Factory Defaults</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* MODAL 1: Customize WhatsApp Template */}
      <Modal visible={templateModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#141B20' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                WhatsApp Reminder Message
              </Text>
              <TouchableOpacity onPress={() => setTemplateModalVisible(false)}>
                <Ionicons name="close" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Dynamic tags available: {'{customer_name}'}, {'{amount}'}, {'{business_name}'}
            </Text>
            <TextInput
              style={[
                styles.modalTextArea,
                {
                  backgroundColor: isDark ? '#1C242B' : '#F1F5F9',
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                },
              ]}
              value={tempTemplate}
              onChangeText={setTempTemplate}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: isDark ? '#1C242B' : '#E2E8F0' }]}
                onPress={() => setTemplateModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: isDark ? '#E2E8F0' : '#334155' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={saveTemplateModal}>
                <Text style={styles.modalSaveText}>Save Template</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Edit In-App Announcement */}
      <Modal visible={announcementModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#141B20' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                Edit In-App Announcement
              </Text>
              <TouchableOpacity onPress={() => setAnnouncementModalVisible(false)}>
                <Ionicons name="close" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>BANNER TITLE</Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: isDark ? '#1C242B' : '#F1F5F9',
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                },
              ]}
              value={tempAnnTitle}
              onChangeText={setTempAnnTitle}
              placeholder="e.g. 🎉 Special Update"
              placeholderTextColor="#64748B"
            />

            <Text style={[styles.inputLabel, { color: isDark ? '#94A3B8' : '#64748B', marginTop: 10 }]}>MESSAGE</Text>
            <TextInput
              style={[
                styles.modalTextArea,
                {
                  backgroundColor: isDark ? '#1C242B' : '#F1F5F9',
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                },
              ]}
              value={tempAnnText}
              onChangeText={setTempAnnText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={[styles.inputLabel, { color: isDark ? '#94A3B8' : '#64748B', marginTop: 10 }]}>BANNER TYPE</Text>
            <View style={styles.typeSelectorRow}>
              {(['info', 'success', 'warning'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeSelectorBtn,
                    tempAnnType === t && styles.typeSelectorBtnActive,
                    {
                      backgroundColor:
                        tempAnnType === t
                          ? t === 'info'
                            ? '#3B82F6'
                            : t === 'success'
                            ? '#10B981'
                            : '#F59E0B'
                          : isDark
                          ? '#1C242B'
                          : '#E2E8F0',
                    },
                  ]}
                  onPress={() => setTempAnnType(t)}
                >
                  <Text
                    style={[
                      styles.typeSelectorBtnText,
                      { color: tempAnnType === t ? '#FFFFFF' : isDark ? '#94A3B8' : '#475569' },
                    ]}
                  >
                    {t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: isDark ? '#1C242B' : '#E2E8F0' }]}
                onPress={() => setAnnouncementModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: isDark ? '#E2E8F0' : '#334155' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={saveAnnouncementModal}>
                <Text style={styles.modalSaveText}>Publish Banner</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: Edit Branding & Organization */}
      <Modal visible={brandingModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#141B20' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                Edit Brand & Contact Info
              </Text>
              <TouchableOpacity onPress={() => setBrandingModalVisible(false)}>
                <Ionicons name="close" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>APP NAME</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: isDark ? '#1C242B' : '#F1F5F9', color: isDark ? '#FFFFFF' : '#0F172A' }]}
              value={tempBrandName}
              onChangeText={setTempBrandName}
            />

            <Text style={[styles.inputLabel, { color: isDark ? '#94A3B8' : '#64748B', marginTop: 10 }]}>TAGLINE</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: isDark ? '#1C242B' : '#F1F5F9', color: isDark ? '#FFFFFF' : '#0F172A' }]}
              value={tempTagline}
              onChangeText={setTempTagline}
            />

            <Text style={[styles.inputLabel, { color: isDark ? '#94A3B8' : '#64748B', marginTop: 10 }]}>SUPPORT PHONE / WHATSAPP</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: isDark ? '#1C242B' : '#F1F5F9', color: isDark ? '#FFFFFF' : '#0F172A' }]}
              value={tempPhone}
              onChangeText={setTempPhone}
            />

            <Text style={[styles.inputLabel, { color: isDark ? '#94A3B8' : '#64748B', marginTop: 10 }]}>SUPPORT EMAIL</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: isDark ? '#1C242B' : '#F1F5F9', color: isDark ? '#FFFFFF' : '#0F172A' }]}
              value={tempEmail}
              onChangeText={setTempEmail}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: isDark ? '#1C242B' : '#E2E8F0' }]}
                onPress={() => setBrandingModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: isDark ? '#E2E8F0' : '#334155' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={saveBrandingModal}>
                <Text style={styles.modalSaveText}>Save Brand Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: Edit UPI Payment Settings */}
      <Modal visible={paymentModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#141B20' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                Configure UPI Payment Gateway
              </Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Ionicons name="close" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>DEFAULT MERCHANT UPI ID (VPA)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: isDark ? '#1C242B' : '#F1F5F9', color: isDark ? '#FFFFFF' : '#0F172A' }]}
              value={tempUpiId}
              onChangeText={setTempUpiId}
              placeholder="e.g. 8440003711@upi"
              placeholderTextColor="#64748B"
            />

            <Text style={[styles.inputLabel, { color: isDark ? '#94A3B8' : '#64748B', marginTop: 10 }]}>PAYEE / MERCHANT NAME</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: isDark ? '#1C242B' : '#F1F5F9', color: isDark ? '#FFFFFF' : '#0F172A' }]}
              value={tempMerchantName}
              onChangeText={setTempMerchantName}
              placeholder="e.g. HisabPro Merchant"
              placeholderTextColor="#64748B"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: isDark ? '#1C242B' : '#E2E8F0' }]}
                onPress={() => setPaymentModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: isDark ? '#E2E8F0' : '#334155' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={savePaymentModal}>
                <Text style={styles.modalSaveText}>Save UPI Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 5: Edit Maintenance Message */}
      <Modal visible={maintenanceModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#141B20' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                Maintenance Screen Notice
              </Text>
              <TouchableOpacity onPress={() => setMaintenanceModalVisible(false)}>
                <Ionicons name="close" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>LOCKDOWN SCREEN MESSAGE</Text>
            <TextInput
              style={[
                styles.modalTextArea,
                {
                  backgroundColor: isDark ? '#1C242B' : '#F1F5F9',
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                },
              ]}
              value={tempMaintMsg}
              onChangeText={setTempMaintMsg}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: isDark ? '#1C242B' : '#E2E8F0' }]}
                onPress={() => setMaintenanceModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: isDark ? '#E2E8F0' : '#334155' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={saveMaintenanceModal}>
                <Text style={styles.modalSaveText}>Update Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3D Avatar Picker Modal */}
      <AvatarPickerModal
        visible={avatarPickerVisible}
        selectedAvatarId={profile?.avatar_id || 'abhishek'}
        onClose={() => setAvatarPickerVisible(false)}
        onSelect={async (avatarId: string) => {
          setAvatarPickerVisible(false);
          await updateAvatar(avatarId);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
  },
  brandTitleCol: {
    justifyContent: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitleText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  adminCrownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 122, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.3)',
  },
  adminCrownText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF7A00',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  topHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  savedToastBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  savedToastText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminProfileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adminChipAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminChipInitial: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0B0F11',
  },
  adminChipName: {
    fontSize: 13,
    fontWeight: '800',
  },
  adminChipEmail: {
    fontSize: 11,
    color: '#FF7A00',
  },
  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    gap: 18,
  },
  healthBanner: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  healthDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  healthLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  healthValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  healthDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tabsContainer: {
    width: '100%',
  },
  tabsContent: {
    gap: 10,
    paddingVertical: 4,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabButtonActive: {
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  tabButtonText: {
    fontSize: 13,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
  },
  singleColContainer: {
    width: '100%',
  },
  featureCard: {
    flex: 1,
    minWidth: 320,
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardDesc: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  switchSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  outlineActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 4,
  },
  outlineActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
  },
  primaryActionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  infoDisplayBox: {
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginVertical: 4,
  },
  infoDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoDisplayKey: {
    fontSize: 12,
  },
  infoDisplayVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  announcementPreviewBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginVertical: 6,
  },
  annPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  annPreviewTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  annPreviewText: {
    fontSize: 13,
    lineHeight: 18,
  },
  brandInfoGrid: {
    gap: 10,
  },
  brandInfoItem: {
    padding: 14,
    borderRadius: 12,
    gap: 4,
  },
  brandInfoKey: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  brandInfoVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  userListCol: {
    gap: 10,
  },
  userCardItem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  userCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 200,
  },
  userAvatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0B0F11',
  },
  userNameText: {
    fontSize: 14,
    fontWeight: '800',
  },
  superAdminTag: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  superAdminTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0B0F11',
  },
  adminTag: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userEmailText: {
    fontSize: 12,
    marginTop: 2,
  },
  userCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  userActionMiniBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  userActionMiniBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  quickToolsBox: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  quickToolsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickToolsTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  quickToolsSub: {
    fontSize: 12,
    marginTop: 2,
  },
  quickToolsRight: {
    flexDirection: 'row',
    gap: 10,
  },
  resetDefaultsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resetDefaultsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  modalInput: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 13,
  },
  modalTextArea: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 13,
    minHeight: 90,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeSelectorBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeSelectorBtnActive: {},
  typeSelectorBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalSaveBtn: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalSaveText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B0F11',
  },
});

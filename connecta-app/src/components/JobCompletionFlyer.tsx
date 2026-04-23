import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';

interface JobCompletionFlyerProps {
  visible: boolean;
  onClose: () => void;
  projectData: {
    title: string;
    clientName: string;
    amount: number;
    currency: string;
    freelancerName: string;
    freelancerAvatar?: string;
    completedDate: string;
    category?: string;
  };
}

const { width, height } = Dimensions.get('window');

export default function JobCompletionFlyer({ visible, onClose, projectData }: JobCompletionFlyerProps) {
  const viewShotRef = useRef<any>(null);
  const [capturing, setCapturing] = React.useState(false);
  const c = useThemeColors();

  const handleShare = async () => {
    try {
      setCapturing(true);
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your achievement!',
        UTI: 'public.png',
      });
    } catch (error) {
      console.error('Failed to capture and share:', error);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
          <ViewShot
            ref={viewShotRef}
            options={{ format: 'png', quality: 1.0 }}
            style={styles.flyerContainer}
          >
            <LinearGradient
              colors={['#FD6730', '#FF8C00']}
              style={styles.background}
            >
              <SafeAreaView style={{ flex: 1 }}>
                {/* Decorative spheres */}
                <View style={[styles.sphere, { top: -20, right: -20, width: 150, height: 150, opacity: 0.3 }]} />
                <View style={[styles.sphere, { bottom: 100, left: -40, width: 200, height: 200, opacity: 0.2 }]} />
                
                <View style={styles.innerContent}>
                  <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                     <View style={styles.topLogo}>
                        <Image 
                           source={require('../../assets/app-icon-fixed.png')} 
                           style={styles.logo}
                           resizeMode="contain"
                        />
                        <Text style={styles.logoText}>Connecta</Text>
                     </View>
                     <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Ionicons name="close" size={28} color="white" />
                     </TouchableOpacity>
                  </View>

                  <Text style={styles.title}>PROJECT{'\n'}COMPLETED</Text>

                  <View style={styles.profileSection}>
                    <View style={styles.avatarBorder}>
                      <Image
                        source={projectData.freelancerAvatar ? { uri: projectData.freelancerAvatar } : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(projectData.freelancerName)}&background=random` }}
                        style={styles.avatar}
                      />
                    </View>
                    <Text style={styles.freelancerName}>{projectData.freelancerName}</Text>
                    <Text style={styles.label}>{projectData.category || 'Expert Freelancer'}</Text>
                  </View>

                  <BlurView intensity={20} tint="light" style={styles.glassCard}>
                    <View style={styles.glassInner}>
                      <View style={styles.detailRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.detailLabel}>JOB TITLE</Text>
                          <Text style={styles.detailValue} numberOfLines={1}>{projectData.title}</Text>
                        </View>
                      </View>

                      <View style={styles.detailRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.detailLabel}>CLIENT</Text>
                          <Text style={styles.detailValue} numberOfLines={1}>{projectData.clientName}</Text>
                        </View>
                      </View>

                      <View style={styles.earningsSection}>
                        <Text style={styles.detailLabel}>EARNINGS AMOUNT</Text>
                        <View style={styles.earningsRow}>
                          <Text style={styles.earningsValue}>{projectData.currency}{projectData.amount.toLocaleString()}</Text>
                          <View style={styles.trendIcon}>
                            <MaterialIcons name="trending-up" size={20} color="white" />
                          </View>
                        </View>
                      </View>

                      <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                          <MaterialIcons name="verified" size={16} color="#FFD700" />
                          <Text style={styles.statLabel}>STATUS: Success</Text>
                        </View>
                        <View style={styles.statItem}>
                          <MaterialIcons name="event-available" size={16} color="#FFD700" />
                          <Text style={styles.statLabel}>DATE: {projectData.completedDate}</Text>
                        </View>
                      </View>
                    </View>
                  </BlurView>

                  <View style={styles.footer}>
                    <Text style={styles.tagline}>Empowering African Freelancers</Text>
                    <Text style={styles.website}>www.myconnecta.ng</Text>

                    <TouchableOpacity
                     style={[styles.shareBtn, { backgroundColor: 'white' }]}
                     onPress={handleShare}
                     disabled={capturing}
                     >
                        {capturing ? (
                        <ActivityIndicator color="#FD6730" />
                        ) : (
                        <>
                           <Ionicons name="share-social" size={20} color="#FD6730" />
                           <Text style={[styles.shareBtnText, { color: '#FD6730' }]}>Share Achievement</Text>
                        </>
                        )}
                     </TouchableOpacity>
                  </View>
                </View>
              </SafeAreaView>
            </LinearGradient>
          </ViewShot>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#FD6730',
  },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 4,
  },
  flyerContainer: {
    flex: 1,
  },
  background: {
    flex: 1,
    padding: 24,
  },
  sphere: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'white',
  },
  innerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarBorder: {
    padding: 4,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFD700',
    marginBottom: 10,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  freelancerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  label: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 2,
  },
  glassCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  glassInner: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  earningsSection: {
    marginTop: 5,
    marginBottom: 20,
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  earningsValue: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
  },
  trendIcon: {
    backgroundColor: '#FF8C00',
    padding: 6,
    borderRadius: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  topLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  logo: {
    width: 30,
    height: 30,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: 'white',
  },
  tagline: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginTop: 2,
  },
  website: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 8,
    elevation: 3,
    alignSelf: 'center',
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import * as reviewService from '../services/reviewService';

function Stars({ value, onChange, size = 28 }: { value: number; onChange: (v: number) => void; size?: number }) {
  const c = useThemeColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <TouchableOpacity key={i} onPress={() => onChange(i)} style={{ padding: 4 }}>
          <MaterialIcons name={i <= value ? 'star' : 'star-border'} size={size} color={i <= value ? c.primary : c.subtext} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEaMs9PO8RpCcUmNGl7najJmrJIGVdyoAjtxRV1HjFDK3CNKJ1cqEPe6O8T_tFN57z47zlCRI9jKF8ZXvBTX4pQhzG2C-0j6ToJ0f0l5V_iO6UslVZaKaCXZPO_tzPtg5j6L6EJkgJu--NMcyQUrUyfbP5vqJ6KlIkm9qk8mXjHIH4CYGqDofA34BgqH2V32OumiC8VDSDnDHI4Tx5Ffn559R6rnkbaw4aN8uHvFXZDaEeKs616eP9NOcyyWEkmiZSmHYj0TRGPP0';

const ClientWriteReviewScreen: React.FC<any> = ({ navigation, route }) => {
  const c = useThemeColors();
  const { projectId, revieweeId, projectTitle, freelancerName, freelancerAvatar } = route.params || {};
  const [overall, setOverall] = useState(4);
  const [comm, setComm] = useState(5);
  const [quality, setQuality] = useState(4);
  const [time, setTime] = useState(4);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('Please add a comment to your review.');
      return;
    }

    try {
      setIsLoading(true);
      // Calculate average rating from sub-ratings if backend supports it, 
      // OR just use overall. For now, we'll send overall as the main rating.
      // If backend schema supports sub-ratings (communication, quality, time), we should send them in 'tags' or separate fields.
      // Looking at controller, it takes 'rating', 'comment', 'tags'.

      await reviewService.createReview({
        projectId,
        revieweeId,
        reviewerType: 'client',
        rating: overall,
        comment: text,
      });

      navigation.replace('ClientProjects');
    } catch (error) {
      console.error('Submit review error:', error);
      alert('Failed to submit review');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        <View style={[styles.appBar, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack?.()} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={22} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.h1, { color: c.text }]}>Write a Review</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            <View style={styles.infoRow}>
              <Image source={{ uri: freelancerAvatar || AVATAR }} style={styles.avatar} />
              <View style={{ gap: 2 }}>
                <Text style={[styles.infoTitle, { color: c.text }]}>{projectTitle || 'Project Title'}</Text>
                <Text style={{ color: c.subtext }}>Review for {freelancerName || 'Freelancer'}</Text>
              </View>
            </View>

            <Text style={[styles.headline, { color: c.text }]}>How was your overall experience?</Text>

            <View style={{ alignItems: 'center' }}>
              <Stars value={overall} onChange={setOverall} size={36} />
            </View>

            <Text style={[styles.subheader, { color: c.text }]}>Rate Specifics</Text>

            <View style={{ gap: 14 }}>
              <View style={styles.rowBetween}>
                <Text style={[styles.label, { color: c.text }]}>Communication</Text>
                <Stars value={comm} onChange={setComm} />
              </View>
              <View style={styles.rowBetween}>
                <Text style={[styles.label, { color: c.text }]}>Quality</Text>
                <Stars value={quality} onChange={setQuality} />
              </View>
              <View style={styles.rowBetween}>
                <Text style={[styles.label, { color: c.text }]}>Timeliness</Text>
                <Stars value={time} onChange={setTime} />
              </View>
            </View>

            <View style={{ paddingTop: 16 }}>
              <Text style={[styles.textLabel, { color: c.text }]}>Add a detailed review</Text>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Share your experience... What went well? What could be improved?"
                placeholderTextColor={c.subtext}
                style={[styles.textarea, { color: c.text, borderColor: c.border, backgroundColor: c.isDark ? '#23140f' : '#FFFFFF' }]}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              style={[styles.submitBtn, { backgroundColor: c.primary, opacity: isLoading ? 0.7 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Submit Review"
            >
              <Text style={styles.submitText}>{isLoading ? 'Submitting...' : 'Submit Review'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  h1: { fontSize: 18, fontWeight: '800' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: 999, backgroundColor: '#ddd' },
  infoTitle: { fontSize: 16, fontWeight: '700' },
  headline: { textAlign: 'center', fontSize: 24, fontWeight: '800', marginTop: 12 },
  subheader: { fontSize: 18, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 16, fontWeight: '600' },
  textLabel: { fontSize: 16, fontWeight: '800' },
  textarea: { marginTop: 8, borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15, lineHeight: 20, minHeight: 140 },
  submitBtn: { marginTop: 16, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

export default ClientWriteReviewScreen;

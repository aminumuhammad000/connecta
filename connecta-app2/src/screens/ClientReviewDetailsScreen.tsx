import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';

const HERO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6ZapeOOvByVSAoyV6kxUfMlZOYeZhT8XOOBdnD8ob2JZIiIEvPCXQUy0tI1y3PBMPKuQkPl1t8iMr69c4Q6izi6XjwsJX0NHiDo5V-bC8PUbSoVQbFEwoO6ytHvXFpPE9Pbz0XaJGwtP13sgynm6_4rSeSfWbfEBO59cTlSSZG71NppXFQHlZzCBYEZHwyxidCP4HowRXOQJ6PAybWkiCm90THjlFXLH0s-PiFW1t6fYQPnI-cGRrC0OFQS1-WspFqfbmg9a3YeQ';
const AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoObvTj2HYoFTDFURG18mkXKlDZcZHBoNVXUTily6QSHTosSFCjZCoe3GtKk8kVGwhhKjr_F7eYmbt7fz82ivi4Xm4By6iowM3VG8iwSgwBAlGBDWRUU3bJ8ZozDu9grTsk04_sB9gTSlNq6aIBPg8s8sQXYNcq7fYnU1PRU4DyQyTA34e37_MkB3khwS4XWTg1YQOvHvTbYtifDx3WcRHYuq6Y8AWjoQl8s80aKyNvRv42Q9gYhK3Vw3ndqmavHnXe9YopCOpP-Y';
const YOU_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCem0EfsauSc9jwAsJNjUBG4Sa09YMy9vRI5mLMZDJuNteyq8fZZNxvp-Y5ZdwEd6ppgzi8WPM2W5vao9TJGnLm9LMkW7t79yTTfIOoYv1AUYLdS-CbfcGmmkkKvHvikWOeFXaaAije6jHGDVjwiiHOsmxJZEc8-S6e6CmHiorXgdMFJ3G-DJ7EhZfN1abqlFbisD7dYyua5ISfKNQIFjju_XCzMhYyxsTw5Q70mS0aSlHYo0O5JqDXkQPK3HmYA1xMRaJhBf4PlLs';

const ClientReviewDetailsScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        {/* Top App Bar */}
        <View style={[styles.appBar, { borderBottomColor: c.border }]}> 
          <TouchableOpacity onPress={() => navigation.goBack?.()} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={22} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.h1, { color: c.text }]}>Review Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
          {/* Project Context */}
          <View style={{ padding: 16 }}>
            <View style={[styles.contextCard, { borderColor: c.border, backgroundColor: c.card }]}> 
              <Image source={{ uri: HERO }} style={styles.hero} />
              <View style={{ flex: 1, padding: 12 }}>
                <Text style={{ color: c.subtext, fontSize: 12 }}>Completed on Oct 26, 2023</Text>
                <Text style={[styles.contextTitle, { color: c.text }]}>Mobile App UI/UX Redesign</Text>
                <Text style={{ color: c.subtext, fontSize: 13, marginTop: 4 }}>This card shows the project context for the review.</Text>
              </View>
            </View>
          </View>

          {/* Reviewer Info */}
          <View style={{ paddingHorizontal: 16, paddingTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Image source={{ uri: AVATAR }} style={styles.avatar} />
              <View>
                <Text style={[styles.name, { color: c.text }]}>Eleanor Pena</Text>
                <Text style={{ color: c.subtext, fontSize: 12 }}>Client</Text>
              </View>
            </View>
          </View>

          {/* Rating + Date */}
          <View style={{ paddingHorizontal: 16, paddingTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <MaterialIcons key={i} name={i < 4 ? 'star' : 'star-border'} size={20} color={i < 4 ? c.primary : c.subtext} />
              ))}
            </View>
            <Text style={{ color: c.subtext, fontSize: 12 }}>Oct 26, 2023</Text>
          </View>

          {/* Review Body */}
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <Text style={{ color: c.subtext, lineHeight: 20 }}>
              Working with this freelancer was an absolute pleasure. They demonstrated exceptional skill in UI/UX design, transforming our initial concept into a polished, user-friendly mobile application. Communication was seamless, deadlines were consistently met, and the final deliverables exceeded our expectations. I highly recommend them for any design project and look forward to collaborating again in the future.
            </Text>
          </View>

          {/* Actions */}
          <View style={[styles.actionsRow, { borderTopColor: c.border, borderBottomColor: c.border }]}> 
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity style={styles.iconTextBtn}>
                <MaterialIcons name="thumb-up" size={18} color={c.subtext} />
                <Text style={{ color: c.subtext }}>Helpful</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconTextBtn}>
                <MaterialIcons name="thumb-down" size={18} color={c.subtext} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.iconTextBtn}>
              <MaterialIcons name="flag" size={18} color={c.subtext} />
              <Text style={{ color: c.subtext }}>Flag</Text>
            </TouchableOpacity>
          </View>

          {/* Respond Button */}
          <View style={{ padding: 16 }}>
            <TouchableOpacity style={[styles.respondBtn, { backgroundColor: c.primary }]}> 
              <Text style={styles.respondText}>Respond to Review</Text>
            </TouchableOpacity>
          </View>

          {/* Public Response */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Your Public Response</Text>
            <View style={[styles.responseCard, { backgroundColor: c.isDark ? '#111827' : '#F3F4F6' }]}> 
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Image source={{ uri: YOU_AVATAR }} style={{ width: 32, height: 32, borderRadius: 999 }} />
                <View>
                  <Text style={{ color: c.text, fontSize: 12, fontWeight: '700' }}>You</Text>
                  <Text style={{ color: c.subtext, fontSize: 11 }}>Oct 28, 2023</Text>
                </View>
              </View>
              <Text style={{ color: c.subtext, fontSize: 13, lineHeight: 18 }}>
                Thank you for the kind words, Eleanor! It was a fantastic experience working with you and your team. I'm thrilled you're happy with the final design.
              </Text>
            </View>
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
  contextCard: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden', flexDirection: 'row' },
  hero: { width: 120, height: 120, backgroundColor: '#ddd' },
  contextTitle: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  avatar: { width: 48, height: 48, borderRadius: 999, backgroundColor: '#ddd' },
  name: { fontSize: 16, fontWeight: '800' },
  actionsRow: { marginTop: 12, paddingVertical: 12, paddingHorizontal: 16, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconTextBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  respondBtn: { height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  respondText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 8, marginTop: 4 },
  responseCard: { borderRadius: 10, padding: 12 },
});

export default ClientReviewDetailsScreen;

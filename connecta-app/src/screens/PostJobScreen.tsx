import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Logo from '../components/Logo';

const PostJobScreen: React.FC = () => {
  const c = useThemeColors();
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(['UI/UX Design', 'Figma', 'Prototyping']);
  const [deadline, setDeadline] = useState('');

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (!skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  };

  const removeSkill = (s: string) => {
    setSkills(prev => prev.filter(x => x !== s));
  };

  const submit = () => {
    // Placeholder submit; integrate API later
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}> 
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}> 
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: c.border }]}> 
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <MaterialIcons name="arrow-back" size={22} color={c.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: c.text }]}>Post a New Job</Text>
            <View style={styles.rightLogo}>
              <Logo size={28} />
            </View>
          </View>

          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}> 
            {/* Title */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.label, { color: c.text }]}>Job Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. UX/UI Designer for Mobile App"
                placeholderTextColor={c.subtext}
                style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
              />
            </View>

            {/* Description */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.label, { color: c.text }]}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the project, responsibilities, and deliverables..."
                placeholderTextColor={c.subtext}
                style={[styles.textarea, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            {/* Budget */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.label, { color: c.text }]}>Budget ($)</Text>
              <View style={{ position: 'relative' }}>
                <Text style={[styles.currency, { color: c.subtext }]}>$</Text>
                <TextInput
                  value={budget}
                  onChangeText={setBudget}
                  placeholder="1500"
                  placeholderTextColor={c.subtext}
                  keyboardType="number-pad"
                  style={[styles.input, styles.inputWithPrefix, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
                />
              </View>
            </View>

            {/* Skills */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.label, { color: c.text }]}>Required Skills</Text>
              <View style={[styles.skillsBox, { borderColor: c.border, backgroundColor: c.card }]}> 
                <View style={styles.skillsRow}> 
                  {skills.map(s => (
                    <View key={s} style={[styles.skillChip, { backgroundColor: c.isDark ? 'rgba(253,103,48,0.2)' : 'rgba(253,103,48,0.1)' }]}> 
                      <Text style={[styles.skillText, { color: c.primary }]}>{s}</Text>
                      <TouchableOpacity onPress={() => removeSkill(s)}>
                        <Text style={[styles.skillRemove, { color: c.primary }]}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                <TextInput
                  value={skillInput}
                  onChangeText={setSkillInput}
                  onSubmitEditing={addSkill}
                  placeholder="Add a skill and press Enter"
                  placeholderTextColor={c.subtext}
                  style={[styles.skillInput, { color: c.text }]}
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Deadline */}
            <View style={{ marginBottom: 8 }}>
              <Text style={[styles.label, { color: c.text }]}>Deadline</Text>
              <TextInput
                value={deadline}
                onChangeText={setDeadline}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={c.subtext}
                style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
              />
            </View>

            {/* Submit */}
            <View style={{ paddingTop: 8, paddingBottom: 32 }}>
              <TouchableOpacity onPress={submit} activeOpacity={0.9} style={[styles.submitBtn, { backgroundColor: c.primary }]}> 
                <Text style={styles.submitText}>Post Job</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  rightLogo: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
    minHeight: 120,
  },
  currency: {
    position: 'absolute',
    left: 12,
    top: 14,
    zIndex: 1,
  },
  inputWithPrefix: {
    paddingLeft: 24,
  },
  skillsBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  skillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  skillRemove: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '700',
  },
  skillInput: {
    marginTop: 8,
    fontSize: 16,
  },
  submitBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PostJobScreen;

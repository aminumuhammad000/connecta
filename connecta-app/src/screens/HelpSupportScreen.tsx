import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Linking, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRole } from '../context/RoleContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FAQItem = {
  question: string;
  answer: string;
};

type FAQCategory = {
  id: string;
  title: string;
  items: FAQItem[];
};

const faqData: FAQCategory[] = [
  {
    id: 'general',
    title: 'General Questions',
    items: [
      {
        question: 'What is Connecta?',
        answer: 'Connecta is a premium freelancing platform designed to connect visionary clients with top-tier African talent. We focus on quality, security, and fostering long-term professional relationships.'
      },
      {
        question: 'Is Connecta free to join?',
        answer: 'Yes, signing up for Connecta is completely free for both freelancers and clients. We only charge service fees when you successfully complete a project or hire talent.'
      },
      {
        question: 'Who can use Connecta?',
        answer: 'Connecta is open to skilled professionals (freelancers) looking for work and individuals or businesses (clients) looking to hire talent. We verify all users to ensure a high-quality community.'
      }
    ]
  },
  {
    id: 'account',
    title: 'Account & Verification',
    items: [
      {
        question: 'How do I verify my identity?',
        answer: 'To verify your identity, go to Settings > Verification. You will need to upload a valid government-issued ID (Passport, NIN, or Driver\'s License) and complete a facial verification scan. Verification typically takes 24-48 hours.'
      },
      {
        question: 'Why is my account pending approval?',
        answer: 'We manually review profiles to maintain quality. If your account is pending, please ensure your profile is 100% complete, including a professional photo, detailed bio, and portfolio items.'
      },
      {
        question: 'Can I change my username or email?',
        answer: 'For security reasons, you cannot change your username once set. You can update your email address in Settings, but you will need to verify the new email before the change takes effect.'
      }
    ]
  },
  {
    id: 'jobs',
    title: 'Jobs & Projects',
    items: [
      {
        question: 'How do I find work on Connecta?',
        answer: 'Browse the "Jobs" tab to see available projects that match your skills. You can filter by category, budget, and difficulty. When you find a job you like, submit a detailed proposal outlining why you are the best fit.'
      },
      {
        question: 'What is Connecta Collabo?',
        answer: 'Connecta Collabo is our unique feature for team-based hiring. It allows clients to hire a complete team (e.g., a developer, designer, and product manager) for complex projects, rather than managing individual freelancers separately.'
      },
      {
        question: 'How does the bidding system work?',
        answer: 'When applying for a job, you submit a "bid" which is your proposed price for the project. You can bid the client\'s budget, or higher/lower depending on your expertise and the project scope.'
      }
    ]
  },
  {
    id: 'payments',
    title: 'Payments & Wallet',
    items: [
      {
        question: 'How do I get paid?',
        answer: 'Connecta uses a secure Escrow system. When a client hires you, they deposit the funds into Escrow. Once you complete the work and the client approves it, the funds are released to your Connecta Wallet.'
      },
      {
        question: 'What are the service fees?',
        answer: 'Connecta charges a flat 10% service fee on all completed projects. This fee covers payment processing, platform maintenance, and 24/7 support.'
      },
      {
        question: 'How do I withdraw my earnings?',
        answer: 'You can withdraw funds from your Connecta Wallet directly to your local bank account. Withdrawals are processed within 24 hours. Go to Wallet > Withdraw to initiate a transfer.'
      }
    ]
  },
  {
    id: 'safety',
    title: 'Safety & Security',
    items: [
      {
        question: 'Is my money safe?',
        answer: 'Absolutely. We use industry-standard encryption and a secure Escrow system. Clients pay upfront, but funds are held safely until the work is delivered and approved, protecting both parties.'
      },
      {
        question: 'What happens if a client refuses to pay?',
        answer: 'If a dispute arises, you can initiate our Dispute Resolution process. Our support team will review the project communications and deliverables to make a fair judgment based on the contract terms.'
      },
      {
        question: 'How do I report a suspicious user?',
        answer: 'If you encounter any suspicious activity or a user violating our terms, please use the "Report" button on their profile or message, or contact support immediately.'
      }
    ]
  }
];

const HelpSupportScreen: React.FC<any> = ({ navigation }) => {
  const c = useThemeColors();
  const { role } = useRole();

  // State to track expanded categories
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
    'general': true // Open first one by default
  });

  // State to track expanded questions within categories
  // Format: "categoryId-questionIndex"
  const [expandedQuestions, setExpandedQuestions] = useState<{ [key: string]: boolean }>({});

  const toggleCategory = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategories(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleQuestion = (categoryId: string, index: number) => {
    const key = `${categoryId}-${index}`;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleContact = async (type: 'whatsapp' | 'email' | 'call') => {
    try {
      switch (type) {
        case 'whatsapp':
          await Linking.openURL('whatsapp://send?phone=2348128655555');
          break;
        case 'email':
          await Linking.openURL('mailto:support@myconnecta.ng');
          break;
        case 'call':
          await Linking.openURL('tel:08128655555');
          break;
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 600, alignSelf: 'center' }}>
        {/* Top App Bar */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => navigation.goBack?.()} style={{ width: 48, height: 48, alignItems: 'flex-start', justifyContent: 'center' }}>
            <MaterialIcons name="arrow-back" size={22} color={c.text} />
          </TouchableOpacity>
          <Text style={{ color: c.text, fontSize: 18, fontWeight: '600' }}>Help & Support</Text>
          <View style={{ width: 48 }} />
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          <View style={[styles.searchWrap, { backgroundColor: c.card, borderColor: c.border }]}>
            <MaterialIcons name="search" size={22} color={c.subtext} style={{ marginHorizontal: 12 }} />
            <TextInput
              placeholder="What can we help you with?"
              placeholderTextColor={c.subtext}
              style={{ flex: 1, color: c.text, height: '100%' }}
            />
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
          {/* FAQ Headline */}
          <Text style={{ color: c.text, fontSize: 24, fontWeight: '600', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}>
            Frequently Asked Questions
          </Text>

          {/* FAQ Categories */}
          <View style={{ paddingHorizontal: 16 }}>
            {faqData.map((category) => (
              <View key={category.id} style={[styles.categoryContainer, { borderColor: c.border, backgroundColor: c.card }]}>
                {/* Category Header */}
                <TouchableOpacity
                  onPress={() => toggleCategory(category.id)}
                  style={styles.categoryHeader}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryTitle, { color: c.text }]}>{category.title}</Text>
                  <MaterialIcons
                    name="expand-more"
                    size={24}
                    color={c.subtext}
                    style={{ transform: [{ rotate: expandedCategories[category.id] ? '180deg' : '0deg' }] }}
                  />
                </TouchableOpacity>

                {/* Questions List (Visible if Category is Expanded) */}
                {expandedCategories[category.id] && (
                  <View style={styles.questionsList}>
                    {category.items.map((item, index) => {
                      const qKey = `${category.id}-${index}`;
                      const isExpanded = expandedQuestions[qKey];

                      return (
                        <View key={index} style={[
                          styles.questionItem,
                          { borderTopColor: c.border },
                          index === 0 && { borderTopWidth: 0 }
                        ]}>
                          <TouchableOpacity
                            onPress={() => toggleQuestion(category.id, index)}
                            style={styles.questionHeader}
                          >
                            <Text style={[styles.questionText, { color: isExpanded ? c.primary : c.text }]}>
                              {item.question}
                            </Text>
                            <MaterialIcons
                              name={isExpanded ? "remove" : "add"}
                              size={20}
                              color={isExpanded ? c.primary : c.subtext}
                            />
                          </TouchableOpacity>

                          {isExpanded && (
                            <Text style={[styles.answerText, { color: c.subtext }]}>
                              {item.answer}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Contact Options */}
          <View style={{ paddingHorizontal: 16, paddingTop: 32, gap: 12 }}>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '600', marginBottom: 4 }}>Still need help?</Text>

            <TouchableOpacity
              style={[styles.contactRow, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={() => handleContact('whatsapp')}
            >
              <View style={[styles.iconBox, { backgroundColor: '#25D36620' }]}>
                <MaterialIcons name="chat" size={24} color="#25D366" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactLabel, { color: c.text }]}>WhatsApp Support</Text>
                <Text style={{ color: c.subtext, fontSize: 13 }}>Chat instantly with our team</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={c.subtext} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactRow, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={() => handleContact('email')}
            >
              <View style={[styles.iconBox, { backgroundColor: c.primary + '20' }]}>
                <MaterialIcons name="email" size={24} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactLabel, { color: c.text }]}>Email Support</Text>
                <Text style={{ color: c.subtext, fontSize: 13 }}>support@myconnecta.ng</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={c.subtext} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactRow, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={() => handleContact('call')}
            >
              <View style={[styles.iconBox, { backgroundColor: '#3B82F620' }]}>
                <MaterialIcons name="call" size={24} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactLabel, { color: c.text }]}>Call Us</Text>
                <Text style={{ color: c.subtext, fontSize: 13 }}>Mon-Fri, 9am - 5pm</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={c.subtext} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchWrap: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  categoryContainer: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  questionsList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  questionItem: {
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
    paddingRight: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderRadius: 16,
    borderWidth: 1
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
});

export default HelpSupportScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
// import Logo from '../components/Logo';
import * as jobService from '../services/jobService';
import * as paymentService from '../services/paymentService';
import { useInAppAlert } from '../components/InAppAlert';
import PaymentWebView from '../components/PaymentWebView';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import SuccessModal from '../components/SuccessModal';
import { JOB_CATEGORIES, JOB_TYPES, LOCATION_SCOPES, LOCATION_TYPES, DURATION_TYPES } from '../utils/categories';
import { LinearGradient } from 'expo-linear-gradient';
import * as aiService from '../services/aiService';
import AnimatedBackground from '../components/AnimatedBackground';
import ResponsiveOnboardingWrapper from '../components/ResponsiveOnboardingWrapper';
const { width } = Dimensions.get('window');

const COMMON_TIMEZONES = [
  { label: 'GMT', value: 'GMT (London/Accra)' },
  { label: 'EST', value: 'EST (New York/Toronto)' },
  { label: 'PST', value: 'PST (Los Angeles/Vancouver)' },
  { label: 'CET', value: 'CET (Berlin/Paris/Rome)' },
  { label: 'WAT', value: 'WAT (Lagos/Luanda)' },
  { label: 'IST', value: 'IST (India)' },
  { label: 'JST', value: 'JST (Tokyo/Seoul)' },
  { label: 'AEST', value: 'AEST (Sydney/Melbourne)' },
];

const CATEGORY_SKILLS: Record<string, string[]> = {
  tech: ['AI/ML', 'Angular', 'AWS', 'C#', 'C++', 'Cybersecurity', 'Django', 'Docker', 'Firebase', 'Flask', 'Flutter', 'Go', 'GraphQL', 'Java', 'Jenkins', 'Kotlin', 'Kubernetes', 'Laravel', 'MongoDB', 'Next.js', 'Node.js', 'NoSQL', 'PHP', 'PostgreSQL', 'Python', 'React Native', 'Redis', 'Ruby on Rails', 'Rust', 'SQL', 'Svelte', 'Swift', 'Terraform', 'TypeScript', 'Vue.js'].sort(),
  design: ['3D Modeling', 'Adobe XD', 'After Effects', 'Blender', 'Branding', 'Canva', 'Character Design', 'Figma', 'Game UI', 'Graphic Design', 'Illustrator', 'InDesign', 'Infographics', 'Logo Design', 'Motion Graphics', 'Package Design', 'Photoshop', 'Premiere Pro', 'Print Design', 'Prototyping', 'Sketch', 'Typography', 'UI/UX', 'Vector Art', 'Web Design'].sort(),
  marketing: ['Affiliate Marketing', 'Analytics', 'Brand Identity', 'Content Strategy', 'Copywriting', 'Customer Acquisition', 'Email Marketing', 'Funnel Building', 'Google Ads', 'Growth Hacking', 'Influencer Marketing', 'Market Research', 'Meta Ads', 'PPC', 'Public Relations', 'Retargeting', 'SEO', 'SMS Marketing', 'Social Media', 'TikTok Marketing'].sort(),
  business: ['Accounting', 'Bookkeeping', 'Business Strategy', 'CRM', 'Data Analysis', 'Data Entry', 'Excel', 'Financial Analysis', 'HR', 'Hubspot', 'Legal Research', 'Market Analysis', 'Operations', 'Project Management', 'QuickBooks', 'Risk Management', 'Sales', 'Salesforce', 'Strategic Planning', 'Supply Chain', 'Virtual Assistant', 'Xero'].sort(),
  writing: ['Academic Writing', 'Blog Writing', 'Case Studies', 'Content Writing', 'Copywriting', 'Cover Letters', 'Creative Non-fiction', 'Creative Writing', 'Editing', 'Ghostwriting', 'Grant Writing', 'Press Releases', 'Proofreading', 'Resume Writing', 'Scriptwriting', 'SEO Writing', 'Technical Writing', 'Translation', 'White Papers'].sort(),
  education: ['Corporate Training', 'Course Creation', 'Curriculum Design', 'Early Childhood', 'Educational Consulting', 'E-learning', 'Instructional Design', 'Language Teaching', 'LMS', 'Online Teaching', 'Special Education', 'STEM Education', 'Test Prep', 'Tutoring'].sort(),
  health: ['Dietetics', 'Fitness Coaching', 'Healthcare Admin', 'Medical Writing', 'Mental Health', 'Mindfulness', 'Nursing', 'Nutrition', 'Occupational Therapy', 'Personal Training', 'Pharmacy', 'Physical Therapy', 'Sports Nutrition', 'Telehealth', 'Wellness Coaching', 'Yoga'].sort(),
  hospitality: ['Barista', 'Bartending', 'Catering', 'Concierge', 'Culinary Arts', 'Customer Service', 'Event Management', 'Event Planning', 'Front Desk', 'Hotel Management', 'Housekeeping', 'Tourism', 'Tour Guiding', 'Travel Planning'].sort(),
};

const NIGERIA_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara'
];

const PostJobScreen: React.FC = () => {
  const c = useThemeColors();
  const navigation = useNavigation();
  const { showAlert } = useInAppAlert();

  const route = useRoute<any>();
  const { mode, jobId } = route.params || {};
  const isEditMode = mode === 'edit';

  // Steps: 0: Basics, 1: Details, 2: Budget, 3: Preview
  const [currentStep, setCurrentStep] = useState(0);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  // New fields required by backend
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [experience, setExperience] = useState('Intermediate');
  const [jobType, setJobType] = useState('fixed'); 
  const [hiringType, setHiringType] = useState<'job' | 'freelance'>('freelance');
  const [customBudgetType, setCustomBudgetType] = useState('');
  const [locationType, setLocationType] = useState('remote');

  const [isLoading, setIsLoading] = useState(false);
  const [jobPostingFee, setJobPostingFee] = useState(0);

  useEffect(() => {
    const fetchFee = async () => {
      try {
        const settings = await import('../services/settingsService').then(m => m.default.getSystemSettings());
        if (settings?.payments?.jobPostingFee !== undefined) {
          setJobPostingFee(settings.payments.jobPostingFee);
        }
      } catch (error) {
        console.error('Error fetching job posting fee:', error);
      }
    };
    fetchFee();
  }, []);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentPromptModal, setShowPaymentPromptModal] = useState(false);
  const [isTransferSelected, setIsTransferSelected] = useState(true); // Default to Transfer
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { user, token } = useAuth();

  // New State Variables
  const [jobScope, setJobScope] = useState('local');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [durationType, setDurationType] = useState('months');
  const [durationValue, setDurationValue] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dynamicSkills, setDynamicSkills] = useState<string[]>([]);
  const [isFetchingDynamicSkills, setIsFetchingDynamicSkills] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState<any>(null);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [walletBalance, setWalletBalance] = useState<any>(null);

  useEffect(() => {
    if (isEditMode && jobId) {
      loadJobDetails();
    }
  }, [isEditMode, jobId]);

  const generateAIDescription = async () => {
    if (!title || !category) {
      Alert.alert('Missing Info', 'Please enter a job title and category first so I can generate a description for you.');
      return;
    }
    try {
      setIsGeneratingDescription(true);
      const prompt = `Generate a professional, engaging job description for a "${title}" position in the "${category}" category. The description should be concise, professional, and highlight key responsibilities. Keep it between 50 and 80 words. Return ONLY the description text.`;
      const result = await aiService.sendAIQuery(prompt, user?._id || '', 'client');

      if (result) {
        // Typing effect
        let currentText = '';
        const words = result.split(' ');
        for (let i = 0; i < words.length; i++) {
          currentText += (i === 0 ? '' : ' ') + words[i];
          setDescription(currentText);
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }
    } catch (error) {
      console.error('AI Description Error:', error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const suggestAISkills = async () => {
    if (!title) {
      Alert.alert('Missing Title', 'Enter a job title first to get skill suggestions.');
      return;
    }
    try {
      setIsSuggestingSkills(true);
      const prompt = `Suggest 5 essential technical skills for a job titled "${title}". Return ONLY the skills as a comma-separated list, no other text.`;
      const result = await aiService.sendAIQuery(prompt, user?._id || '', 'client');

      if (result) {
        const suggested = result.split(',').map(s => s.trim()).filter(s => s && !skills.includes(s));
        setSkills(prev => [...prev, ...suggested]);
      }
    } catch (error) {
      console.error('AI Skills Error:', error);
    } finally {
      setIsSuggestingSkills(false);
    }
  };

  useEffect(() => {
    if (selectedCategoryId) {
      fetchDynamicSkills();
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    if (showPaymentPromptModal) {
      paymentService.getVTStackVirtualAccount()
        .then(res => setVirtualAccount(res))
        .catch(err => console.error('Error fetching virtual account:', err));

      paymentService.getWalletBalance()
        .then(res => setWalletBalance(res))
        .catch(err => console.error('Error fetching wallet balance:', err));
    }
  }, [showPaymentPromptModal]);

  const fetchDynamicSkills = async () => {
    try {
      setIsFetchingDynamicSkills(true);
      // External skills API is currently unavailable, using category defaults
      setDynamicSkills((CATEGORY_SKILLS[selectedCategoryId] || []).sort());
    } catch (error) {
      console.error('Error fetching dynamic skills:', error);
      setDynamicSkills((CATEGORY_SKILLS[selectedCategoryId] || []).sort());
    } finally {
      setIsFetchingDynamicSkills(false);
    }
  };



  const loadJobDetails = async () => {
    try {
      setIsLoading(true);
      const job = await jobService.getJobById(jobId);
      if (job) {
        setTitle(job.title);
        setDescription(job.description);
        setBudget(String(job.budget));
        setSkills(job.skills || []);
        setCompany(job.company || '');
        setLocation(job.location || '');
        setCategory(job.category || '');
        setExperience(job.experience || 'Intermediate');
        const bt = job.budgetType || 'fixed';
        if (['fixed', 'hourly', 'weekly', 'monthly'].includes(bt)) {
          setJobType(bt);
        } else {
          setJobType('custom');
          setCustomBudgetType(bt);
        }
        setLocationType(job.locationType || 'remote');
      }
    } catch (error) {
      console.error('Error loading job details:', error);
      Alert.alert('Error', 'Failed to load job details');
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (!skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  };

  const removeSkill = (s: string) => {
    setSkills(prev => prev.filter(x => x !== s));
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 0) {
      if (!title.trim()) newErrors.title = 'Job title is required';
      if (!company.trim()) newErrors.company = 'Company or project name is required';
      if (!category) newErrors.category = 'Please select a category';
      if (!description.trim()) newErrors.description = 'Please provide a job description';
    } else if (currentStep === 1) {
      if (!location.trim()) newErrors.location = 'Location is required';
      if (!experience) newErrors.experience = 'Please select an experience level';
    } else if (currentStep === 2) {
      if (!budget || isNaN(parseFloat(budget))) newErrors.budget = 'Please enter a valid budget';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Optional: Haptic feedback or subtle toast could go here
      return false;
    }
    return true;
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      if (currentStep < 3) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const initiatePaymentForJob = async () => {
    try {
      setIsLoading(true);

      const tempJobData = {
        title,
        description,
        budget: String(budget),
        skills,
        company,
        location,
        category,
        experience,
        jobType: hiringType as any,
        budgetType: jobType === 'custom' ? (customBudgetType || 'custom') : jobType,
        status: 'pending' as any, // Mark as pending initially
        locationType: locationType as any,
        jobScope,
        duration: durationValue,
        durationType: durationType as any,
      };

      const createdJob = await jobService.createJob(tempJobData);

      console.log('Initializing payment for job:', createdJob._id);

      const response = await paymentService.initializeJobVerification({
        jobId: createdJob._id,
        amount: jobPostingFee, // Paid the platform fee
        description: `Job posting fee for: ${title}`,
      });

      setPaymentUrl(response.authorizationUrl);
      setPaymentReference(response.reference);
      // After successful creation
      if (jobPostingFee === 0) {
        // If fee is 0, activate immediately
        await jobService.updateJob(createdJob._id, { status: 'active' as any, paymentVerified: true });
        setIsLoading(false);
        setSuccessMessage('Job posted successfully! It is now active and freelancers can see it.');
        setIsSuccessVisible(true);
      } else {
        // Show payment prompt
        setIsLoading(false);
        setShowPaymentPromptModal(true);
      }
    } catch (error: any) {
      setIsLoading(false);
      showAlert({ title: 'Error', message: error.message || 'Failed to create job', type: 'error' });
    }
  };

  const handleWalletPayment = async () => {
    try {
      setIsLoading(true);

      // 1. Create Job first if it doesn't exist (new post)
      let targetJobId = jobId;
      if (!isEditMode || !targetJobId) {
        const tempJobData = {
          title,
          description,
          budget: String(budget),
          skills,
          company,
          location,
          category,
          experience,
          jobType: hiringType as any,
          budgetType: jobType === 'custom' ? (customBudgetType || 'custom') : jobType,
          status: 'pending' as any,
          locationType: locationType as any,
          jobScope,
          duration: durationValue,
          durationType: durationType as any,
        };
        const createdJob = await jobService.createJob(tempJobData);
        targetJobId = createdJob._id;
      }

      // 2. Process wallet payment
      const response = await paymentService.payFromWallet({
        type: 'job_verification',
        amount: jobPostingFee, // Paid the platform fee
        jobId: targetJobId,
        description: `Job posting fee for: ${title}`,
      });

      if (response && response.success) {
        setShowPaymentPromptModal(false);
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('Wallet payment error:', error);
      Alert.alert('Payment Failed', error.message || 'Could not process wallet payment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      setShowPaymentModal(false);
      setIsLoading(true);

      // Verify payment with backend
      const verifiedPayment = await paymentService.verifyPayment(paymentReference, transactionId);

      if (verifiedPayment && (verifiedPayment.jobVerified || verifiedPayment.payment?.status === 'completed' || verifiedPayment.status === 'completed')) {
        // Payment verified - job is already updated to active by backend
        // Show animated success modal instead of alert
        setShowSuccessModal(true);
        // Navigation will happen on modal close
      } else {
        throw new Error('Payment verification failed or pending');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      Alert.alert('Error', error.message || 'Payment verification failed. Please contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    Alert.alert('Payment Cancelled', 'You can try again when ready.');
  };

  const submitJob = () => {
    if (jobPostingFee === 0) {
      submitJobWithStatus('active');
    } else {
      setShowPaymentPromptModal(true);
    }
  };

  const submitJobWithStatus = async (statusArg: string) => {
    try {
      setIsLoading(true);

      const jobData = {
        title,
        description,
        budget: String(budget),
        skills,
        company,
        location,
        category,
        experience,
        jobType: hiringType as any,
        budgetType: jobType === 'custom' ? (customBudgetType || 'custom') : jobType,
        locationType: locationType as any,
        jobScope,
        duration: durationValue,
        durationType: durationType as any,
        status: statusArg as any,
      };

      await jobService.createJob(jobData);

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error posting job:', error);
      Alert.alert('Error', error.message || 'Failed to post job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateJob = async () => {
    try {
      setIsLoading(true);

      const jobData = {
        title,
        description,
        budget: String(budget),
        skills,
        company,
        location,
        category,
        experience,
        jobType: hiringType as any,
        budgetType: jobType === 'custom' ? (customBudgetType || 'custom') : jobType,
        locationType: locationType as any,
        jobScope,
        duration: durationValue,
        durationType: durationType as any,
      };

      await jobService.updateJob(jobId, jobData);

      showAlert({
        title: 'Success!',
        message: 'Job updated successfully.',
        type: 'success',
      });

      navigation.goBack();
    } catch (error: any) {
      console.error('Error updating job:', error);
      Alert.alert('Error', error.message || 'Failed to update job');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const progress = ((currentStep + 1) / 4) * 100;
    return (
      <View style={styles.progressContainer}>
        <View style={[styles.progressBarBackground, { backgroundColor: c.border + '40' }]}>
          <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: c.primary }]} />
        </View>
        <View style={styles.stepInfoRow}>
          <Text style={[styles.stepCountText, { color: c.subtext }]}>STEP {currentStep + 1} OF 4</Text>
          <Text style={[styles.stepNameText, { color: c.text }]}>
            {currentStep === 0 ? 'Basics' : currentStep === 1 ? 'Details' : currentStep === 2 ? 'Budget' : 'Review'}
          </Text>
        </View>
      </View>
    );
  };



  const { width } = Dimensions.get('window');
  const isDesktop = width >= 768;

  const renderBasics = () => (
    <View style={styles.stepWrapperContent}>
      <View style={styles.stepHeader}>
        <Text style={[styles.stepMainTitle, { color: c.text }]}>The Basics</Text>
        <Text style={[styles.stepSubTitle, { color: c.subtext }]}>Set the foundation for your project. Be clear and professional.</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: c.text }]}>Hiring Mode</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
          <TouchableOpacity
            onPress={() => setHiringType('job')}
            style={[
              styles.categoryCard,
              {
                flex: 1,
                borderColor: hiringType === 'job' ? c.primary : c.border,
                borderWidth: hiringType === 'job' ? 2 : 1,
                padding: 16,
                alignItems: 'center',
                backgroundColor: hiringType === 'job' ? c.primary + '08' : c.card
              }
            ]}
          >
            <View style={[styles.catIconCircle, { backgroundColor: hiringType === 'job' ? c.primary : c.border + '20' }]}>
              <MaterialIcons name="business-center" size={24} color={hiringType === 'job' ? '#FFF' : c.subtext} />
            </View>
            <Text style={{ marginTop: 8, fontWeight: '700', color: hiringType === 'job' ? c.primary : c.text }}>Post a Job</Text>
            <Text style={{ fontSize: 10, color: c.subtext, textAlign: 'center', marginTop: 4 }}>Full-time or regular employment (No Escrow)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setHiringType('freelance')}
            style={[
              styles.categoryCard,
              {
                flex: 1,
                borderColor: hiringType === 'freelance' ? c.primary : c.border,
                borderWidth: hiringType === 'freelance' ? 2 : 1,
                padding: 16,
                alignItems: 'center',
                backgroundColor: hiringType === 'freelance' ? c.primary + '08' : c.card
              }
            ]}
          >
            <View style={[styles.catIconCircle, { backgroundColor: hiringType === 'freelance' ? c.primary : c.border + '20' }]}>
              <MaterialIcons name="work" size={24} color={hiringType === 'freelance' ? '#FFF' : c.subtext} />
            </View>
            <Text style={{ marginTop: 8, fontWeight: '700', color: hiringType === 'freelance' ? c.primary : c.text }}>Post Freelance</Text>
            <Text style={{ fontSize: 10, color: c.subtext, textAlign: 'center', marginTop: 4 }}>Project-based or gig work (Escrow Required)</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={isDesktop ? styles.desktopRow : undefined}>
        <View style={[styles.inputGroup, isDesktop && styles.desktopHalfCol]}>
          <Text style={[styles.label, { color: errors.title ? '#EF4444' : c.text }]}>Job Title</Text>
          <TextInput
            value={title}
            onChangeText={(t) => { setTitle(t); clearError('title'); }}
            placeholder="e.g. Senior Product Designer"
            placeholderTextColor={c.subtext}
            style={[
              styles.giantInput,
              {
                color: c.text,
                backgroundColor: c.card,
                borderColor: errors.title ? '#EF4444' : c.border,
                borderWidth: errors.title ? 2 : 1
              }
            ]}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        <View style={[styles.inputGroup, isDesktop && styles.desktopHalfCol]}>
          <Text style={[styles.label, { color: errors.company ? '#EF4444' : c.text }]}>Company or Project Name</Text>
          <TextInput
            value={company}
            onChangeText={(t) => { setCompany(t); clearError('company'); }}
            placeholder="e.g. Acme Corp"
            placeholderTextColor={c.subtext}
            style={[
              styles.giantInput,
              {
                color: c.text,
                backgroundColor: c.card,
                borderColor: errors.company ? '#EF4444' : c.border,
                borderWidth: errors.company ? 2 : 1
              }
            ]}
          />
          {errors.company && <Text style={styles.errorText}>{errors.company}</Text>}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: errors.category ? '#EF4444' : c.text }]}>Category</Text>
        <View style={styles.categoryGrid}>
          {JOB_CATEGORIES.map(cat => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  setSelectedCategoryId(cat.id);
                  setCategory(cat.label);
                  clearError('category');
                }}
                activeOpacity={0.7}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: c.card,
                    borderColor: isSelected ? c.primary : (errors.category ? '#EF4444' : c.border),
                    borderWidth: isSelected || errors.category ? 2 : 1,
                    elevation: isSelected ? 4 : 1,
                    shadowColor: isSelected ? c.primary : '#000',
                    shadowOpacity: isSelected ? 0.15 : 0.05,
                    // Desktop specific tweak if needed, but grid handles wrap nicely
                  }
                ]}
              >
                <View style={[
                  styles.catIconCircle,
                  { backgroundColor: isSelected ? c.primary + '15' : (errors.category ? '#EF4444' + '10' : c.border + '30') }
                ]}>
                  <MaterialIcons
                    name={cat.icon as any}
                    size={22}
                    color={isSelected ? c.primary : (errors.category ? '#EF4444' : c.subtext)}
                  />
                </View>
                <View style={styles.catTextWrapper}>
                  <Text style={[
                    styles.catCardText,
                    { color: isSelected ? c.text : (errors.category ? '#EF4444' : c.subtext), fontWeight: isSelected ? '800' : '600' }
                  ]}>
                    {cat.label}
                  </Text>
                </View>
                {isSelected && (
                  <View style={[styles.selectionIndicator, { backgroundColor: c.primary }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
      </View>



      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: errors.description ? '#EF4444' : c.text }]}>Description</Text>
        <TextInput
          value={description}
          onChangeText={(t) => { setDescription(t); clearError('description'); }}
          placeholder="Describe what you need..."
          placeholderTextColor={c.subtext}
          style={[
            styles.giantTextarea,
            {
              color: c.text,
              backgroundColor: c.card,
              borderColor: errors.description ? '#EF4444' : c.border,
              borderWidth: errors.description ? 2 : 1
            }
          ]}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
      </View>
    </View>
  );

  const renderDetails = () => (
    <View style={styles.stepWrapperContent}>
      <View style={styles.stepHeader}>
        <Text style={[styles.stepMainTitle, { color: c.text }]}>Project Details</Text>
        <Text style={[styles.stepSubTitle, { color: c.subtext }]}>Define the scope and expertise required for your project.</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.refinedLabel, { color: c.text }]}>WORKPLACE TYPE</Text>
        <View style={styles.compactToggleRow}>
          <TouchableOpacity
            onPress={() => setLocationType('remote')}
            style={[styles.compactToggleBtn, { backgroundColor: locationType === 'remote' ? c.primary : c.card }]}
          >
            <MaterialIcons name="laptop-mac" size={16} color={locationType === 'remote' ? '#FFF' : c.subtext} />
            <Text style={[styles.compactToggleText, { color: locationType === 'remote' ? '#FFF' : c.text }]}>Remote</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setLocationType('onsite')}
            style={[styles.compactToggleBtn, { backgroundColor: locationType === 'onsite' ? c.primary : c.card }]}
          >
            <MaterialIcons name="business" size={16} color={locationType === 'onsite' ? '#FFF' : c.subtext} />
            <Text style={[styles.compactToggleText, { color: locationType === 'onsite' ? '#FFF' : c.text }]}>On-Site</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setLocationType('hybrid')}
            style={[styles.compactToggleBtn, { backgroundColor: locationType === 'hybrid' ? c.primary : c.card }]}
          >
            <MaterialIcons name="compare-arrows" size={16} color={locationType === 'hybrid' ? '#FFF' : c.subtext} />
            <Text style={[styles.compactToggleText, { color: locationType === 'hybrid' ? '#FFF' : c.text }]}>Hybrid</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location & Scope Combined */}
      <View style={styles.inputGroup}>
        <Text style={[styles.refinedLabel, { color: errors.location ? '#EF4444' : c.text }]}>LOCATION & SCOPE</Text>
        <View style={styles.compactToggleRow}>
          {LOCATION_SCOPES.map(scope => (
            <TouchableOpacity
              key={scope.id}
              onPress={() => {
                setJobScope(scope.id);
                clearError('location');
              }}
              style={[
                styles.compactToggleBtn,
                {
                  backgroundColor: jobScope === scope.id ? c.primary : c.card,
                }
              ]}
            >
              <MaterialIcons
                name={scope.id === 'local' ? 'near-me' : 'language'}
                size={16}
                color={jobScope === scope.id ? '#FFF' : c.subtext}
              />
              <Text style={[styles.compactToggleText, { color: jobScope === scope.id ? '#FFF' : c.text }]}>
                {scope.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={[styles.helperLabel, { color: c.subtext }]}>
            {jobScope === 'local'
              ? "Where is this job located? (e.g. Lagos, Nigeria)"
              : "Preferred timezone or region (Optional)"}
          </Text>
          {jobScope === 'local' ? (
            <TouchableOpacity 
              onPress={() => setShowStatePicker(true)}
              style={[
                styles.refinedInput,
                {
                  color: c.text,
                  backgroundColor: c.card,
                  borderColor: errors.location ? '#EF4444' : c.border,
                  height: 48,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16
                }
              ]}
            >
              <Text style={{ color: location ? c.text : c.subtext, fontSize: 13, fontWeight: '700' }}>
                {location || "Select State in Nigeria"}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color={c.subtext} />
            </TouchableOpacity>
          ) : (
            <TextInput
              value={location}
              onChangeText={(t) => { setLocation(t); clearError('location'); }}
              placeholder="e.g. GMT+1 or Worldwide"
              placeholderTextColor={c.subtext}
              style={[
                styles.refinedInput,
                {
                  color: c.text,
                  backgroundColor: c.card,
                  borderColor: errors.location ? '#EF4444' : c.border,
                  height: 48,
                }
              ]}
            />
          )}
        </View>

        {jobScope === 'international' && (
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.miniLabel, { color: c.subtext }]}>SUGGESTED TIMEZONES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 8 }}>
              {COMMON_TIMEZONES.map(tz => (
                <TouchableOpacity
                  key={tz.label}
                  onPress={() => {
                    setLocation(tz.value);
                    clearError('location');
                  }}
                  style={[
                    styles.tzChip,
                    {
                      backgroundColor: location === tz.value ? c.primary : c.card,
                      borderColor: location === tz.value ? c.primary : c.border,
                    }
                  ]}
                >
                  <Text style={[styles.tzText, { color: location === tz.value ? '#FFF' : c.text }]}>
                    {tz.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
      </View>

      {/* Expertise Level */}
      <View style={styles.inputGroup}>
        <Text style={[styles.refinedLabel, { color: errors.experience ? '#EF4444' : c.text }]}>EXPERIENCE LEVEL</Text>
        <View style={styles.expertiseGrid}>
          {['Entry', 'Intermediate', 'Expert'].map(lvl => {
            const isSelected = experience === lvl;
            const icon = lvl === 'Entry' ? 'eco' : lvl === 'Intermediate' ? 'trending-up' : 'workspace-premium';
            return (
              <TouchableOpacity
                key={lvl}
                onPress={() => {
                  setExperience(lvl);
                  clearError('experience');
                }}
                style={[
                  styles.expertiseCard,
                  {
                    backgroundColor: isSelected ? c.primary + '10' : c.card,
                    borderColor: isSelected ? c.primary : (errors.experience ? '#EF4444' : c.border),
                  }
                ]}
              >
                <MaterialIcons name={icon as any} size={20} color={isSelected ? c.primary : c.subtext} />
                <Text style={[styles.expertiseText, { color: isSelected ? c.text : c.subtext }]}>{lvl}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.experience && <Text style={styles.errorText}>{errors.experience}</Text>}
      </View>

      {/* Skills Selection */}
      <View style={styles.inputGroup}>
        <Text style={[styles.refinedLabel, { color: c.text }]}>SKILLS NEEDED</Text>
        {selectedCategoryId && (
          <View style={{ marginBottom: 16 }}>
            <View style={styles.labelRow}>
              <Text style={[styles.miniLabel, { color: c.subtext }]}>POPULAR IN {category.toUpperCase()}</Text>
              {isFetchingDynamicSkills && <ActivityIndicator size="small" color={c.primary} />}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 8 }}>
              {dynamicSkills.map(s => {
                const isAdded = skills.includes(s);
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => isAdded ? removeSkill(s) : setSkills(prev => [...prev, s])}
                    style={[
                      styles.tzChip,
                      {
                        backgroundColor: isAdded ? c.primary : c.card,
                        borderColor: isAdded ? c.primary : c.border,
                      }
                    ]}
                  >
                    <Text style={[styles.tzText, { color: isAdded ? '#FFF' : c.text }]}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={[styles.figmaSkillsBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.figmaSkillsFlow}>
            {skills.map(s => (
              <View key={s} style={[styles.figmaSkillChip, { backgroundColor: c.border + '40' }]}>
                <Text style={[styles.figmaSkillText, { color: c.text }]}>{s}</Text>
                <TouchableOpacity onPress={() => removeSkill(s)}>
                  <MaterialIcons name="close" size={12} color={c.subtext} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TextInput
            value={skillInput}
            onChangeText={setSkillInput}
            onSubmitEditing={addSkill}
            placeholder="Add skill manually..."
            placeholderTextColor={c.subtext}
            style={[styles.figmaSkillInput, { color: c.text }]}
          />
        </View>
      </View>

      {/* Duration - Simplified */}
      <View style={styles.inputGroup}>
        <Text style={[styles.refinedLabel, { color: c.text }]}>ESTIMATED DURATION</Text>
        <TextInput
          value={durationValue}
          onChangeText={setDurationValue}
          placeholder="e.g. 5"
          keyboardType="numeric"
          placeholderTextColor={c.subtext}
          style={[styles.refinedInput, { width: '100%', marginBottom: 12 }]}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {DURATION_TYPES.map(dt => (
            <TouchableOpacity
              key={dt.id}
              onPress={() => setDurationType(dt.id)}
              style={[
                styles.durationChip,
                {
                  backgroundColor: durationType === dt.id ? c.text : c.card,
                  borderColor: durationType === dt.id ? c.text : c.border,
                }
              ]}
            >
              <Text style={[styles.durationChipText, { color: durationType === dt.id ? c.background : c.text }]}>
                {dt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderBudget = () => (
    <View style={styles.stepWrapperContent}>
      <View style={styles.stepHeader}>
        <Text style={[styles.stepMainTitle, { color: c.text }]}>Budget & Time</Text>
        <Text style={[styles.stepSubTitle, { color: c.subtext }]}>Set your project budget and estimated completion date.</Text>
      </View>

      {/* Payment Type Selection */}
      <View style={styles.inputGroup}>
        <Text style={[styles.refinedLabel, { color: c.text }]}>PAYMENT TYPE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {[
            { id: 'fixed', label: 'Per Project' },
            { id: 'hourly', label: 'Hourly' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'custom', label: 'Custom' }
          ].map(type => (
            <TouchableOpacity
              key={type.id}
              onPress={() => setJobType(type.id)}
              style={[
                styles.durationChip,
                {
                  backgroundColor: jobType === type.id ? c.primary : c.card,
                  borderColor: jobType === type.id ? c.primary : c.border,
                }
              ]}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: jobType === type.id ? '#FFF' : c.text }}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {jobType === 'custom' && (
          <TextInput
            value={customBudgetType}
            onChangeText={setCustomBudgetType}
            placeholder="e.g. Per Word, Milestone"
            placeholderTextColor={c.subtext}
            style={[styles.refinedInput, { color: c.text, backgroundColor: c.card, borderColor: c.border, marginTop: 12 }]}
          />
        )}
      </View>

      {/* Budget Selection */}
      <View style={styles.inputGroup}>
        <Text style={[styles.refinedLabel, { color: errors.budget ? '#EF4444' : c.text }]}>PROJECT BUDGET</Text>
        <View style={{ position: 'relative', marginTop: 12 }}>
          <View style={styles.budgetIconWrapper}>
            <Text style={{ color: errors.budget ? '#EF4444' : c.subtext, fontWeight: '800', fontSize: 18 }}>
              ₦
            </Text>
          </View>
          <TextInput
            value={budget}
            onChangeText={(t) => { setBudget(t); clearError('budget'); }}
            placeholder="e.g. 50,000"
            placeholderTextColor={c.subtext}
            keyboardType="numeric"
            style={[
              styles.refinedInput,
              {
                color: c.text,
                backgroundColor: c.card,
                borderColor: errors.budget ? '#EF4444' : c.border,
                paddingLeft: 48,
              }
            ]}
          />
        </View>
        {errors.budget && <Text style={styles.errorText}>{errors.budget}</Text>}
        <Text style={[styles.helperLabel, { color: c.subtext, marginTop: 8 }]}>
          Enter the total amount you're willing to pay for this project.
        </Text>
      </View>



    </View>
  );

  const renderPreview = () => (
    <View style={styles.stepWrapperContent}>
      <View style={styles.stepHeader}>
        <Text style={[styles.stepMainTitle, { color: c.text }]}>Review Post</Text>
        <Text style={[styles.stepSubTitle, { color: c.subtext }]}>Check everything one last time before going live.</Text>
      </View>

      {/* Job Overview Card */}
      <View style={[styles.refinedPreviewCard, { backgroundColor: c.card, borderColor: c.border, padding: 0, overflow: 'hidden' }]}>
        <View style={[styles.previewSectionHeader, { padding: 16, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: c.background, marginBottom: 0 }]}>
          <Text style={[styles.refinedLabel, { color: c.text, marginBottom: 0 }]}>JOB OVERVIEW</Text>
          <TouchableOpacity onPress={() => setCurrentStep(0)} style={styles.editBtnSmall}>
            <Text style={[styles.editLink, { color: c.primary }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: c.border + '60' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', opacity: 0.8, color: c.subtext }}>Hiring Mode</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'right', marginLeft: 16, color: c.text, textTransform: 'capitalize' }}>
            {hiringType === 'job' ? 'Direct Hiring (Job)' : 'Freelance Project'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: c.border + '60' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', opacity: 0.8, color: c.subtext }}>Title</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'right', marginLeft: 16, color: c.text }}>{title}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: c.border + '60' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', opacity: 0.8, color: c.subtext }}>Company</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'right', marginLeft: 16, color: c.text }}>{company}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: c.border + '60' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', opacity: 0.8, color: c.subtext }}>Category</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'right', marginLeft: 16, color: c.text }}>{category}</Text>
        </View>
        <View style={{ flexDirection: 'column', alignItems: 'flex-start', paddingVertical: 14, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', opacity: 0.8, color: c.subtext, marginBottom: 8 }}>Description</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: c.text, textAlign: 'left', lineHeight: 22 }}>{description}</Text>
        </View>
      </View>

      {/* Details & Skills Card */}
      <View style={[styles.refinedPreviewCard, { backgroundColor: c.card, borderColor: c.border, padding: 0, overflow: 'hidden', marginTop: 16 }]}>
        <View style={[styles.previewSectionHeader, { padding: 16, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: c.background, marginBottom: 0 }]}>
          <Text style={[styles.refinedLabel, { color: c.text, marginBottom: 0 }]}>DETAILS & SKILLS</Text>
          <TouchableOpacity onPress={() => setCurrentStep(1)} style={styles.editBtnSmall}>
            <Text style={[styles.editLink, { color: c.primary }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: c.border + '60' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', opacity: 0.8, color: c.subtext }}>Location</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'right', marginLeft: 16, color: c.text }}>{location || 'Remote'} {locationType ? `(${locationType})` : ''}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: c.border + '60' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', opacity: 0.8, color: c.subtext }}>Experience</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'right', marginLeft: 16, color: c.text }}>{experience}</Text>
        </View>
        <View style={{ flexDirection: 'column', alignItems: 'flex-start', paddingVertical: 14, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', opacity: 0.8, color: c.subtext, marginBottom: 8 }}>Skills Required</Text>
          <View style={[styles.previewSkillsRow, { marginTop: 0 }]}>
            {skills.map(s => (
              <View key={s} style={[styles.refinedSkillChip, { backgroundColor: c.primary + '10', borderColor: c.primary + '20', borderWidth: 1 }]}>
                <Text style={[styles.refinedSkillText, { color: c.primary }]}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Budget & Timeline Card */}
      <View style={[styles.refinedPreviewCard, { backgroundColor: c.card, borderColor: c.border, padding: 0, overflow: 'hidden', marginTop: 16 }]}>
        <View style={[styles.previewSectionHeader, { padding: 16, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: c.background, marginBottom: 0 }]}>
          <Text style={[styles.refinedLabel, { color: c.text, marginBottom: 0 }]}>BUDGET & TIMELINE</Text>
          <TouchableOpacity onPress={() => setCurrentStep(2)} style={styles.editBtnSmall}>
            <Text style={[styles.editLink, { color: c.primary }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: c.border + '60' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', opacity: 0.8, color: c.subtext }}>Payment Type</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'right', marginLeft: 16, color: c.text, textTransform: 'capitalize' }}>
            {jobType === 'custom' ? customBudgetType || 'Custom' : jobType.replace('-', ' ')}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: c.border + '60' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', opacity: 0.8, color: c.subtext }}>Total Budget</Text>
          <Text style={{ fontSize: 16, fontWeight: '900', flex: 1, textAlign: 'right', marginLeft: 16, color: c.primary }}>₦{budget}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', opacity: 0.8, color: c.subtext }}>Est. Duration</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'right', marginLeft: 16, color: c.text }}>{durationValue || '0'} {durationType}</Text>
        </View>
      </View>

      {/* Info Banner */}
      <View style={[styles.premiumEscrowBanner, { backgroundColor: c.primary + '08', borderColor: c.primary + '20' }]}>
        <LinearGradient
          colors={[c.primary, '#FF9F70']}
          style={styles.escrowIconCircle}
        >
          <MaterialIcons name="info" size={20} color="#FFF" />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={[styles.premiumEscrowTitle, { color: c.text }]}>Job Visibility</Text>
          <Text style={[styles.premiumEscrowText, { color: c.subtext }]}>
            Your job will be visible to freelancers once it has been reviewed and approved.
          </Text>
        </View>
      </View>
    </View>
  );




  const sideContent = (
    <View style={styles.desktopSide}>
      <View style={[styles.bigIconBox, { backgroundColor: c.primary + '15' }]}>
        <MaterialIcons name="work-outline" size={70} color={c.primary} />
      </View>
      <Text style={[styles.sideTitle, { color: c.text }]}>Find Talent</Text>
      <Text style={[styles.sideSub, { color: c.subtext }]}>
        Post your job and connect with expert freelancers ready to work.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <AnimatedBackground />
      <ResponsiveOnboardingWrapper sideComponent={sideContent}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.mainWrapper}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
              <TouchableOpacity
                onPress={() => currentStep > 0 ? prevStep() : navigation.goBack()}
                style={styles.iconBtn}
              >
                <MaterialIcons
                  name={currentStep > 0 ? "arrow-back" : "close"}
                  size={24}
                  color={c.text}
                />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: c.text }]}>Post a New Job</Text>
              <View style={{ width: 40 }} />
            </View>

            <>
              {renderStepIndicator()}
              <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {currentStep === 0 && renderBasics()}
                {currentStep === 1 && renderDetails()}
                {currentStep === 2 && renderBudget()}
                {currentStep === 3 && renderPreview()}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 32, marginBottom: 20 }}>
                  <Button
                    title={
                      currentStep === 3
                        ? isEditMode
                          ? 'Update'
                          : 'Post Job'
                        : 'Next'
                    }
                    onPress={
                      currentStep === 3
                        ? isEditMode
                          ? handleUpdateJob
                          : submitJob
                        : nextStep
                    }
                    style={styles.smallNextBtn}
                    loading={isLoading}
                    variant="primary"
                    size="medium"
                  />
                </View>
              </ScrollView>
            </>

            <SuccessModal
              visible={showSuccessModal}
              title="Job Posted!"
              message="Your job has been posted successfully and is pending approval."
              buttonText="Go to My Jobs"
              onClose={() => {
                setShowSuccessModal(false);
                navigation.goBack();
              }}
            />

          </View>
        </KeyboardAvoidingView>
      </ResponsiveOnboardingWrapper>

      {/* Modals outside wrapper if needed, but here mostly inline or simple. 
          CalendarModal is outside scope of this return. 
          PaymentWebView modal should be here? wait.
      */}
      <PaymentWebView
        visible={showPaymentModal}
        paymentUrl={paymentUrl}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />

      {/* Modern Payment Options Prompt Modal */}
      <Modal
        visible={showPaymentPromptModal}
        transparent={true}
        animationType="fade"
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{
            backgroundColor: c.card,
            borderRadius: 24,
            width: '100%',
            maxWidth: 400,
            maxHeight: '90%',
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}>
            <ScrollView 
               contentContainerStyle={{ padding: 24, alignItems: 'center' }}
               showsVerticalScrollIndicator={false}
            >
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.primary + '10', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <MaterialIcons name="payments" size={32} color={c.primary} />
              </View>
              
              {/* Existing modal content here... */}
              
              {/* [Rest of the existing logic from the previous edit is preserved] */}
              {/* I must re-insert the logic because I'm replacing a larger block */}
              
              {/* ... (re-applying the optimized content) ... */}
            
            <Text style={[styles.modalTitle, { color: c.text, textAlign: 'center', marginBottom: 8 }]}>Activate Your Job</Text>
            <Text style={{ fontSize: 13, color: c.subtext, textAlign: 'center', lineHeight: 18, marginBottom: 20 }}>
              {isTransferSelected ? "Transfer the exact fee amount to the account below." : "Post your job and start receiving proposals."}
            </Text>

            {/* Wallet Balance Status - Hide if transfer selected to save space */}
            {walletBalance && !isTransferSelected && (
              <View style={{ 
                width: '100%', 
                backgroundColor: c.isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB',
                padding: 12,
                borderRadius: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                borderWidth: 1,
                borderColor: c.border
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="wallet-outline" size={18} color={c.subtext} />
                  <Text style={{ fontSize: 13, color: c.subtext, fontWeight: '600' }}>Wallet Balance</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '800', color: walletBalance.availableBalance >= jobPostingFee ? '#10B981' : '#EF4444' }}>
                  ₦{walletBalance.availableBalance.toLocaleString()}
                </Text>
              </View>
            )}

            <View style={{ width: '100%', marginBottom: isTransferSelected ? 20 : 32, gap: 8 }}>
              {hiringType === 'freelance' && !isTransferSelected && (
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 4
                }}>
                  <Text style={{ fontSize: 13, color: c.subtext, fontWeight: '500' }}>Project Budget (Escrow)</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>₦{Number(budget || 0).toLocaleString()}</Text>
                </View>
              )}
              
              <View style={{ 
                backgroundColor: c.primary + '10', 
                padding: 14, 
                borderRadius: 16, 
                width: '100%', 
                borderWidth: 1,
                borderColor: c.primary + '20',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: c.text }}>Job Posting Fee</Text>
                  {!isTransferSelected && <Text style={{ fontSize: 10, color: c.subtext, marginTop: 1 }}>Non-refundable platform fee</Text>}
                </View>
                <Text style={{ fontSize: 18, fontWeight: '900', color: c.primary }}>₦{jobPostingFee.toLocaleString()}</Text>
              </View>
            </View>

            {isTransferSelected && virtualAccount ? (
              <LinearGradient
                colors={[c.primary, c.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ 
                  width: '100%', 
                  borderRadius: 20, 
                  padding: 20, 
                  marginBottom: 20,
                  ...c.shadows.medium
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <MaterialIcons name="account-balance" size={14} color="#FFF" />
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFF', letterSpacing: 1 }}>BANK TRANSFER</Text>
                </View>

                <View style={{ gap: 10 }}>
                  <View>
                    <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>BANK NAME</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFF' }}>{virtualAccount.bankName}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>ACCOUNT NUMBER</Text>
                    <Text style={{ fontSize: 20, fontWeight: '900', color: '#FFF', letterSpacing: 1 }}>{virtualAccount.accountNumber}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>ACCOUNT NAME</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFF' }}>{virtualAccount.accountName}</Text>
                  </View>
                </View>
              </LinearGradient>
            ) : null}

            <View style={{ width: '100%', gap: 10 }}>
              {!isTransferSelected ? (
                <>
                  {walletBalance && walletBalance.availableBalance >= jobPostingFee && (
                    <TouchableOpacity
                      style={{
                        width: '100%',
                        paddingVertical: 14,
                        borderRadius: 14,
                        backgroundColor: '#10B981',
                        alignItems: 'center',
                        shadowColor: '#10B981',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 6,
                        elevation: 3,
                      }}
                      onPress={handleWalletPayment}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <MaterialIcons name="account-balance-wallet" size={18} color="#FFF" />
                        <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFF' }}>
                          Pay with Wallet
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={{
                      width: '100%',
                      paddingVertical: 14,
                      borderRadius: 14,
                      backgroundColor: c.primary,
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      setShowPaymentPromptModal(false);
                      initiatePaymentForJob();
                    }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFF' }}>Pay with Card/USSD</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      width: '100%',
                      paddingVertical: 14,
                      borderRadius: 14,
                      backgroundColor: c.primary + '08',
                      borderWidth: 1,
                      borderColor: c.primary + '20',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      setIsTransferSelected(true);
                    }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: '600', color: c.primary }}>Pay via Bank Transfer</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={{
                      width: '100%',
                      paddingVertical: 14,
                      borderRadius: 14,
                      backgroundColor: c.primary,
                      alignItems: 'center',
                    }}
                    onPress={() => {
                       setShowPaymentPromptModal(false);
                       setShowSuccessModal(true);
                    }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFF' }}>I have made the transfer</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={{
                      width: '100%',
                      paddingVertical: 12,
                      alignItems: 'center',
                    }}
                    onPress={() => setIsTransferSelected(false)}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: c.subtext }}>Go Back</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Duplicate buttons removed - they are handled in the conditional above */}
              {!isTransferSelected && (
                <TouchableOpacity
                  style={{
                    width: '100%',
                    paddingVertical: 14,
                    borderRadius: 14,
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderColor: c.border,
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    setShowPaymentPromptModal(false);
                    setIsTransferSelected(false);
                    submitJobWithStatus('pending');
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>Skip for Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>

      <StatePickerModal
        visible={showStatePicker}
        onClose={() => setShowStatePicker(false)}
        selectedState={location}
        onSelect={(state: string) => {
          setLocation(state);
          setShowStatePicker(false);
          clearError('location');
        }}
      />
    </SafeAreaView>
  );
};

const CalendarModal = ({ visible, onClose, onSelect, currentDate }: any) => {
  const c = useThemeColors();
  const [viewDate, setViewDate] = useState(new Date(currentDate));

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const renderDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    // Empty slots for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDayEmpty} />);
    }

    // Actual days
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = currentDate.toDateString() === date.toDateString();
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

      days.push(
        <TouchableOpacity
          key={i}
          disabled={isPast}
          onPress={() => onSelect(date)}
          style={[
            styles.calendarDay,
            isSelected && { backgroundColor: c.primary },
            isToday && !isSelected && { borderColor: c.primary, borderWidth: 1 }
          ]}
        >
          <Text style={[
            styles.calendarDayText,
            { color: isSelected ? '#FFF' : isPast ? c.subtext + '50' : c.text }
          ]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }
    return days;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.calendarContainer, { backgroundColor: c.card }]}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))}>
              <MaterialIcons name="chevron-left" size={24} color={c.text} />
            </TouchableOpacity>
            <Text style={[styles.calendarMonthYear, { color: c.text }]}>
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))}>
              <MaterialIcons name="chevron-right" size={24} color={c.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarWeekDays}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <Text key={d} style={[styles.calendarWeekDayText, { color: c.subtext }]}>{d}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {renderDays()}
          </View>

          <TouchableOpacity onPress={onClose} style={styles.calendarCloseBtn}>
            <Text style={{ color: c.primary, fontWeight: '700' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const StatePickerModal = ({ visible, onClose, onSelect, selectedState }: any) => {
  const c = useThemeColors();
  const { height } = Dimensions.get('window');
  
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.calendarContainer, { backgroundColor: c.card, maxHeight: height * 0.8, width: Platform.OS === 'web' ? 400 : '90%' }]}>
          <View style={styles.calendarHeader}>
            <Text style={[styles.calendarMonthYear, { color: c.text }]}>Select Nigeria State</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={c.text} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {NIGERIA_STATES.map(state => (
              <TouchableOpacity
                key={state}
                onPress={() => onSelect(state)}
                style={{
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: c.border,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: c.text, fontSize: 16, fontWeight: selectedState === state ? '800' : '500' }}>
                  {state}
                </Text>
                {selectedState === state && (
                  <MaterialIcons name="check-circle" size={20} color={c.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    width: 20,
    height: 2,
    marginHorizontal: 2,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 4,
  },
  stepWrapperContent: {
    paddingTop: 10,
  },
  stepHeader: {
    marginBottom: 30,
  },
  stepMainTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  stepSubTitle: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6, opacity: 0.7 },
  giantInput: {
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  giantTextarea: {
    fontSize: 14,
    fontWeight: '500',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 100,
  },
  input: {
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  inputWithPrefix: {
    paddingLeft: 35,
  },
  currency: {
    position: 'absolute',
    left: 16,
    top: 14,
    fontSize: 16,
    fontWeight: '700',
    zIndex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiAssistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  aiAssistText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 44) / 2,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    overflow: 'hidden',
  },
  catIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catTextWrapper: {
    height: 28,
    justifyContent: 'center',
  },
  catCardText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomLeftRadius: 30,
    opacity: 0.1,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nicheChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 1,
  },
  nicheText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scopeContainer: {
    gap: 12,
  },
  scopeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    gap: 16,
  },
  scopeIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scopeLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  skillsContainer: {
    borderRadius: 24,
    borderWidth: 2,
    padding: 16,
  },
  skillsFlow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  modernSkillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
  },
  modernSkillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  skillRemoveBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillInputModern: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 8,
  },
  experienceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  expBtn: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  navBtn: {
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  navBtnText: { fontSize: 16, fontWeight: '800' },
  previewCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', opacity: 0.6 },
  previewValue: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  escrowBanner: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    marginTop: 8,
  },
  escrowTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  escrowText: { fontSize: 14, lineHeight: 20 },
  selectionHeader: {
    marginBottom: 32,
    alignItems: 'center',
  },
  selectionMainTitle: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  selectionSubTitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  premiumTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  premiumIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  premiumTypeTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  premiumTypeDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  featureList: {
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
  },
  newBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  selectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    flex: 1,
  },
  refinedLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    opacity: 0.6,
    textTransform: 'uppercase',
  },
  refinedInput: {
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  compactToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  compactToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  compactToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  smallNextBtn: {
    width: 140,
    height: 48,
    borderRadius: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  progressBarBackground: {
    height: 4,
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  stepCountText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  stepNameText: {
    fontSize: 12,
    fontWeight: '700',
  },
  helperLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  expertiseGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  expertiseCard: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  expertiseText: {
    fontSize: 12,
    fontWeight: '700',
  },
  figmaAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  figmaAiText: {
    fontSize: 12,
    fontWeight: '700',
  },
  figmaSkillsBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  figmaSkillsFlow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  figmaSkillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  figmaSkillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  figmaSkillInput: {
    fontSize: 14,
    fontWeight: '500',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  durationChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  miniLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    opacity: 0.6,
  },
  tzChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  tzText: {
    fontSize: 11,
    fontWeight: '700',
  },
  budgetIconWrapper: {
    position: 'absolute',
    left: 16,
    top: 14,
    zIndex: 1,
  },
  deadlineQuickSelect: {
    flexDirection: 'row',
    gap: 10,
  },
  deadlineChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deadlineChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  datePickerTriggerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    width: width * 0.85,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarMonthYear: {
    fontSize: 16,
    fontWeight: '800',
  },
  calendarWeekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  calendarWeekDayText: {
    fontSize: 12,
    fontWeight: '700',
    width: 36,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDay: {
    width: (width * 0.85 - 40) / 7,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  calendarDayEmpty: {
    width: (width * 0.85 - 40) / 7,
    height: 40,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  calendarCloseBtn: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  refinedPreviewCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    marginBottom: 20,
  },
  previewSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editLink: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  previewMainTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  previewMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '45%',
  },
  previewMetaText: {
    fontSize: 13,
    fontWeight: '700',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  previewDescBox: {
    padding: 16,
    borderRadius: 16,
  },
  previewDescription: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.9,
    fontWeight: '500',
  },
  previewSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  editBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(253,103,48,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  previewInfoGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  previewInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewInfoValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  previewSkillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  refinedSkillChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  refinedSkillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  previewBudgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabelSmall: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
    opacity: 0.6,
  },
  previewBudgetValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  previewBudgetBox: {
    padding: 20,
    borderRadius: 20,
  },
  miniIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  currencyToggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  calendarInputBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 1,
  },
  previewDateValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  premiumEscrowBanner: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    gap: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  escrowIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumEscrowTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  premiumEscrowText: {
    fontSize: 13,
    lineHeight: 18,
  },
  desktopRow: {
    flexDirection: 'row',
    gap: 20,
    width: '100%',
  },
  desktopHalfCol: {
    flex: 1,
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  desktopSide: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  bigIconBox: { width: 120, height: 120, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  sideTitle: { fontSize: 44, fontWeight: '900', textAlign: 'center', letterSpacing: -1.5, marginBottom: 16, lineHeight: 52 },
  sideSub: { fontSize: 18, textAlign: 'center', opacity: 0.7, maxWidth: 360, lineHeight: 28 },

});

export default PostJobScreen;

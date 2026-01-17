import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Logo from '../components/Logo';
import * as jobService from '../services/jobService';
import * as paymentService from '../services/paymentService';
import { useInAppAlert } from '../components/InAppAlert';
import PaymentWebView from '../components/PaymentWebView';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import SuccessModal from '../components/SuccessModal';
import { JOB_CATEGORIES, JOB_TYPES, LOCATION_SCOPES, LOCATION_TYPES, DURATION_TYPES } from '../utils/categories';

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
  const [deadline, setDeadline] = useState('');

  // New fields required by backend
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Remote');
  const [category, setCategory] = useState('');
  const [experience, setExperience] = useState('Intermediate');
  const [jobType, setJobType] = useState('fixed'); // 'fixed' or 'hourly'

  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { user, token } = useAuth();
  const [jobMode, setJobMode] = useState<'individual' | 'collabo' | null>(isEditMode ? 'individual' : null);

  // New State Variables
  const [jobScope, setJobScope] = useState('local');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [durationType, setDurationType] = useState('months');
  const [durationValue, setDurationValue] = useState('');

  useEffect(() => {
    if (isEditMode && jobId) {
      loadJobDetails();
    }
  }, [isEditMode, jobId]);

  const loadJobDetails = async () => {
    try {
      setIsLoading(true);
      const job = await jobService.getJobById(jobId);
      if (job) {
        setTitle(job.title);
        setDescription(job.description);
        setBudget(String(job.budget));
        setSkills(job.skills || []);
        if (job.deadline) setDeadline(new Date(job.deadline).toISOString().split('T')[0]);
        setCompany(job.company || '');
        setLocation(job.location || 'Remote');
        setCategory(job.category || '');
        setExperience(job.experience || 'Intermediate');
        setJobType(job.budgetType || 'fixed');
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
    if (currentStep === 0) {
      if (!title || !company || !category || !description) {
        Alert.alert('Missing Fields', 'Please fill in all required fields.');
        return false;
      }
    } else if (currentStep === 1) {
      if (!location || !experience) {
        Alert.alert('Missing Fields', 'Please fill in all required fields.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!budget || !deadline) {
        Alert.alert('Missing Fields', 'Please fill in all required fields.');
        return false;
      }
    }
    return true;
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

  const initiatePayment = async () => {
    try {
      setIsLoading(true);

      // We need to create the job first to get the jobId, then initialize payment
      // For now, let's create a temporary job record
      const tempJobData = {
        title,
        description,
        budget: String(budget),
        skills,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        company,
        location,
        category,
        experience,
        jobType: 'freelance' as any,
        budgetType: jobType,
        status: 'draft' as any, // Mark as draft until payment is complete
        locationType: 'remote' as any,
      };

      const createdJob = await jobService.createJob(tempJobData);

      // Now initialize payment for this job
      console.log('Initializing payment for job:', createdJob._id);

      const response = await paymentService.initializeJobVerification({
        jobId: createdJob._id,
        amount: parseFloat(budget),
        description: `Payment for job posting: ${title}`,
      });

      setPaymentUrl(response.authorizationUrl);
      setPaymentReference(response.reference);
      setShowPaymentModal(true);
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      Alert.alert('Error', error.message || 'Failed to initialize payment. Please try again.');
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

  const submitJob = async (paymentStatus = 'pending', paymentReference = '') => {
    try {
      setIsLoading(true);

      const jobData = {
        title,
        description,
        budget: String(budget),
        skills,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        company,
        location,
        category,
        experience,
        jobType: jobType as any, // 'full-time', 'contract', etc.
        budgetType: 'fixed', // Force fixed budget for now or add toggle
        status: 'active' as any,
        locationType: 'remote' as any, // This should also be dynamic if needed
        jobScope,
        niche: subCategory || undefined,
        duration: durationValue,
        durationType: durationType as any,
        paymentStatus,
        paymentReference,
        paymentVerified: paymentStatus === 'escrow',
      };

      await jobService.createJob(jobData);

      showAlert({
        title: 'Success!',
        message: 'Your job has been posted and payment is held in escrow.',
        type: 'success',
      });

      navigation.goBack();
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
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        company,
        location,
        category,
        experience,
        jobType: 'freelance' as any,
        budgetType: jobType,
        locationType: 'remote' as any,
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

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      {[0, 1, 2, 3].map((step) => (
        <View key={step} style={styles.stepWrapper}>
          <View style={[
            styles.stepDot,
            {
              backgroundColor: step <= currentStep ? c.primary : c.border,
              borderColor: step === currentStep ? c.primary : 'transparent',
              borderWidth: step === currentStep ? 2 : 0
            }
          ]}>
            {step < currentStep && <MaterialIcons name="check" size={12} color="#FFF" />}
          </View>
          {step < 3 && <View style={[styles.stepLine, { backgroundColor: step < currentStep ? c.primary : c.border }]} />}
        </View>
      ))}
    </View>
  );



  const renderBasics = () => (
    <View>
      <Text style={[styles.stepTitle, { color: c.text }]}>Job Basics</Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: c.text }]}>Job Title *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. UX/UI Designer for Mobile App"
          placeholderTextColor={c.subtext}
          style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: c.text }]}>Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
          {JOB_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => {
                setSelectedCategoryId(cat.id);
                setCategory(cat.label);
                setSubCategory('');
              }}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedCategoryId === cat.id ? c.primary : c.card,
                  borderColor: selectedCategoryId === cat.id ? c.primary : c.border
                }
              ]}
            >
              <MaterialIcons
                name={cat.icon as any}
                size={16}
                color={selectedCategoryId === cat.id ? '#FFF' : c.text}
                style={{ marginRight: 4 }}
              />
              <Text style={{ color: selectedCategoryId === cat.id ? '#FFF' : c.text, fontWeight: '600' }}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedCategoryId && JOB_CATEGORIES.find(c => c.id === selectedCategoryId)?.subcategories.length ? (
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: c.text }]}>Specialization (Niche) *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {JOB_CATEGORIES.find(c => c.id === selectedCategoryId)?.subcategories.map(sub => (
              <TouchableOpacity
                key={sub}
                onPress={() => setSubCategory(sub)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: subCategory === sub ? c.primary + '20' : c.card,
                    borderColor: subCategory === sub ? c.primary : c.border
                  }
                ]}
              >
                <Text style={{ color: subCategory === sub ? c.primary : c.text }}>{sub}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: c.text }]}>Company Name *</Text>
        <TextInput
          value={company}
          onChangeText={setCompany}
          placeholder="e.g. Tech Solutions Inc."
          placeholderTextColor={c.subtext}
          style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: c.text }]}>Description *</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the project..."
          placeholderTextColor={c.subtext}
          style={[styles.textarea, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderDetails = () => (
    <View>
      <Text style={[styles.stepTitle, { color: c.text }]}>Job Details</Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: c.text }]}>Scope & Location *</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          {LOCATION_SCOPES.map(scope => (
            <TouchableOpacity
              key={scope.id}
              onPress={() => setJobScope(scope.id)}
              style={[
                styles.selectionBox,
                {
                  borderColor: jobScope === scope.id ? c.primary : c.border,
                  backgroundColor: jobScope === scope.id ? c.primary + '10' : c.card
                }
              ]}
            >
              <MaterialIcons
                name={scope.id === 'local' ? 'place' : 'public'}
                size={20}
                color={jobScope === scope.id ? c.primary : c.subtext}
              />
              <Text style={[styles.selectionText, { color: jobScope === scope.id ? c.primary : c.text }]}>
                {scope.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder={jobScope === 'local' ? "e.g. Lagos, Nigeria" : "e.g. Remote / Worldwide"}
          placeholderTextColor={c.subtext}
          style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: c.text }]}>Job Type *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {JOB_TYPES.map(type => (
            <TouchableOpacity
              key={type.id}
              onPress={() => setJobType(type.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: jobType === type.id ? c.primary : c.card,
                  borderColor: jobType === type.id ? c.primary : c.border
                }
              ]}
            >
              <Text style={{ color: jobType === type.id ? '#FFF' : c.text, fontWeight: '600' }}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: c.text }]}>Duration</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TextInput
            value={durationValue}
            onChangeText={setDurationValue}
            placeholder="e.g. 3"
            keyboardType="numeric"
            placeholderTextColor={c.subtext}
            style={[styles.input, { flex: 0.3, color: c.text, borderColor: c.border, backgroundColor: c.card }]}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, alignItems: 'center' }}>
            {DURATION_TYPES.map(dt => (
              <TouchableOpacity
                key={dt.id}
                onPress={() => setDurationType(dt.id)}
                style={[
                  styles.chip,
                  {
                    paddingVertical: 12,
                    backgroundColor: durationType === dt.id ? c.primary + '20' : c.card,
                    borderColor: durationType === dt.id ? c.primary : c.border
                  }
                ]}
              >
                <Text style={{ color: durationType === dt.id ? c.primary : c.text }}>{dt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: c.text }]}>Experience Level *</Text>
        <TextInput
          value={experience}
          onChangeText={setExperience}
          placeholder="e.g. Intermediate"
          placeholderTextColor={c.subtext}
          style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
        />
      </View>


      <View style={styles.inputGroup}>
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
    </View>
  );

  const renderBudget = () => (
    <View>
      <Text style={[styles.stepTitle, { color: c.text }]}>Budget & Timeline</Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: c.text }]}>Budget ($) *</Text>
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

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: c.text }]}>Deadline (YYYY-MM-DD) *</Text>
        <TextInput
          value={deadline}
          onChangeText={setDeadline}
          placeholder="2024-12-31"
          placeholderTextColor={c.subtext}
          style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
        />
      </View>
    </View>
  );

  const renderPreview = () => (
    <View>
      <Text style={[styles.stepTitle, { color: c.text }]}>Review & Post</Text>

      <View style={[styles.previewCard, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.previewHeader}>
          <Text style={[styles.previewLabel, { color: c.subtext }]}>Job Basics</Text>
          <TouchableOpacity onPress={() => setCurrentStep(0)}>
            <MaterialIcons name="edit" size={20} color={c.primary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.previewValue, { color: c.text }]}>{title}</Text>
        <Text style={[styles.previewValue, { color: c.text }]}>{company}</Text>
        <Text style={[styles.previewValue, { color: c.text }]}>{category}</Text>
      </View>

      <View style={[styles.previewCard, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.previewHeader}>
          <Text style={[styles.previewLabel, { color: c.subtext }]}>Details</Text>
          <TouchableOpacity onPress={() => setCurrentStep(1)}>
            <MaterialIcons name="edit" size={20} color={c.primary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.previewValue, { color: c.text }]}>{location} ({experience})</Text>
        <View style={styles.skillsRow}>
          {skills.map(s => (
            <View key={s} style={[styles.skillChip, { backgroundColor: c.isDark ? 'rgba(253,103,48,0.2)' : 'rgba(253,103,48,0.1)' }]}>
              <Text style={[styles.skillText, { color: c.primary }]}>{s}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.previewCard, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.previewHeader}>
          <Text style={[styles.previewLabel, { color: c.subtext }]}>Budget & Timeline</Text>
          <TouchableOpacity onPress={() => setCurrentStep(2)}>
            <MaterialIcons name="edit" size={20} color={c.primary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.previewValue, { color: c.text }]}>${budget} ({jobType})</Text>
        <Text style={[styles.previewValue, { color: c.text }]}>Deadline: {deadline}</Text>
      </View>

      <View style={[styles.escrowBanner, { backgroundColor: '#F0FDF4', borderColor: '#22c55e' }]}>
        <MaterialIcons name="verified-user" size={24} color="#22c55e" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.escrowTitle, { color: '#15803d' }]}>Secure Escrow Payment</Text>
          <Text style={[styles.escrowText, { color: '#166534' }]}>
            Your payment of ${budget} will be held securely in escrow until the job is completed.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTypeSelection = () => (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={[styles.stepTitle, { color: c.text, textAlign: 'center', marginBottom: 30 }]}>
        What are you hiring for?
      </Text>

      <TouchableOpacity
        style={[styles.typeCard, { backgroundColor: c.card, borderColor: c.border }]}
        onPress={() => setJobMode('individual')}
      >
        <View style={[styles.iconCircle, { backgroundColor: c.primary + '20' }]}>
          <MaterialIcons name="person" size={32} color={c.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.typeTitle, { color: c.text }]}>Individual Freelancer</Text>
          <Text style={[styles.typeDesc, { color: c.subtext }]}>
            Post a job to hire a single expert for a specific task or role.
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={c.subtext} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.typeCard, { backgroundColor: c.card, borderColor: c.border }]}
        onPress={() => navigation.navigate('PostCollaboJob')}
      >
        <View style={[styles.iconCircle, { backgroundColor: '#8B5CF620' }]}>
          <MaterialIcons name="groups" size={32} color="#8B5CF6" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.typeTitle, { color: c.text }]}>Collabo Team</Text>
          <Text style={[styles.typeDesc, { color: c.subtext }]}>
            Build a complete team for complex projects. AI manages roles & budget.
          </Text>
        </View>
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>NEW</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <MaterialIcons name="close" size={24} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: c.text }]}>Post a New Job</Text>
          <View style={{ width: 40 }} />
        </View>

        {(!jobMode && !isEditMode) ? (
          renderTypeSelection()
        ) : (
          <>
            {renderStepIndicator()}
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
              {currentStep === 0 && renderBasics()}
              {currentStep === 1 && renderDetails()}
              {currentStep === 2 && renderBudget()}
              {currentStep === 3 && renderPreview()}
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: c.border, backgroundColor: c.background }]}>
              {currentStep > 0 && (
                <TouchableOpacity onPress={prevStep} style={[styles.navBtn, { borderColor: c.border, borderWidth: 1 }]}>
                  <Text style={[styles.navBtnText, { color: c.text }]}>Back</Text>
                </TouchableOpacity>
              )}

              <Button
                title={
                  currentStep === 3
                    ? isEditMode
                      ? 'Update Job'
                      : 'Proceed to Payment'
                    : 'Next'
                }
                onPress={
                  currentStep === 3
                    ? isEditMode
                      ? handleUpdateJob
                      : initiatePayment
                    : nextStep
                }
                style={{ flex: 1 }}
                loading={isLoading}
              />
            </View>
          </>
        )}

        {/* Flutterwave Payment WebView */}
        <PaymentWebView
          visible={showPaymentModal}
          paymentUrl={paymentUrl}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />

        <SuccessModal
          visible={showSuccessModal}
          title="Payment Successful!"
          message="Your job has been posted and payment is held securely in escrow."
          buttonText="Go to My Jobs"
          onClose={() => {
            setShowSuccessModal(false);
            navigation.goBack();
          }}
        />

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... existing styles ...
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 4,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 24,
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 16,
    minHeight: 120,
  },
  currency: { position: 'absolute', left: 16, top: 14, zIndex: 1, fontSize: 16 },
  inputWithPrefix: { paddingLeft: 28 },
  skillsBox: { borderWidth: 1, borderRadius: 12, padding: 12 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  skillText: { fontSize: 13, fontWeight: '700' },
  skillRemove: { marginLeft: 6, fontSize: 16, fontWeight: '700' },
  skillInput: { marginTop: 8, fontSize: 16 },
  typeBtn: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  typeText: { fontWeight: '600' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
  },
  navBtn: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  navBtnText: { fontSize: 16, fontWeight: '700' },
  previewCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  previewValue: { fontSize: 16, marginBottom: 4 },
  escrowBanner: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginTop: 8,
  },
  escrowTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  escrowText: { fontSize: 14, lineHeight: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  paymentBody: { alignItems: 'center' },
  paymentLabel: { fontSize: 14, marginBottom: 8 },
  paymentAmount: { fontSize: 32, fontWeight: '800', marginBottom: 24 },
  cardMock: {
    width: '100%',
    height: 60,
    backgroundColor: '#092C4C',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  paymentNote: { textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  payBtn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  // New Styles
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  typeDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recommendedText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
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
  selectionText: {
    fontWeight: '600',
    fontSize: 14,
  },
});

export default PostJobScreen;

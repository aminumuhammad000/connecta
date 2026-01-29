# Client Profile Enhancement Implementation Plan

## Overview
Enhance ClientEditProfileScreen with Portfolio, Education, and Work Experience sections plus premium UX features.

## Changes Required

### 1. Add Imports
```typescript
import * as Haptics from 'expo-haptics';
import { Animated } from 'react-native';
import Button from '../components/Button';
import { PortfolioItem, EducationItem, EmploymentItem } from '../types';
```

### 2. Add State Variables
```typescript
// Portfolio state
const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
const [showPortfolioModal, setShowPortfolioModal] = useState(false);
const [editingPortfolioIndex, setEditingPortfolioIndex] = useState<number | null>(null);
const [portfolioForm, setPortfolioForm] = useState({
    title: '', description: '', imageUrl: '', projectUrl: '', tags: ''
});

// Education state
const [education, setEducation] = useState<EducationItem[]>([]);
const [showEducationModal, setShowEducationModal] = useState(false);
const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null);
const [educationForm, setEducationForm] = useState({
    institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: ''
});

// Work Experience state
const [workExperience, setWorkExperience] = useState<EmploymentItem[]>([]);
const [showWorkModal, setShowWorkModal] = useState(false);
const [editingWorkIndex, setEditingWorkIndex] = useState<number | null>(null);
const [workForm, setWorkForm] = useState({
    company: '', position: '', startDate: '', endDate: '', description: ''
});
```

### 3. Load Data in loadProfileData
```typescript
setPortfolio(profile?.portfolio || []);
setEducation(profile?.education || []);
setWorkExperience(profile?.workExperience || []);
```

### 4. Add Handlers for Portfolio
```typescript
const handleAddPortfolio = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPortfolioForm({ title: '', description: '', imageUrl: '', projectUrl: '', tags: '' });
    setEditingPortfolioIndex(null);
    setShowPortfolioModal(true);
};

const handleSavePortfolio = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Save logic...
};

const handleDeletePortfolio = (index: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setPortfolio(prev => prev.filter((_, i) => i !== index));
};
```

### 5. Add Handlers for Education (similar pattern)

### 6. Add Handlers for Work Experience (similar pattern)

### 7. Update handleSave to include new data
```typescript
await profileService.updateMyProfile({
    ...existing fields...,
    portfolio,
    education,
    workExperience
});
```

### 8. Add UI Sections
- Portfolio card with add button
- Education card with add button  
- Work Experience card with add button
- Each with edit/delete icons
- Empty states with friendly illustrations

### 9. Add Modals for Add/Edit
- Portfolio modal
- Education modal
- Work Experience modal

### 10. Make Save Button Sticky
```typescript
<View style={[styles.stickyFooter, { backgroundColor: c.background, borderTopColor: c.border }]}>
    <Button title="Save Changes" onPress={handleSave} loading={saving} />
</View>
```

### 11. Add Premium Animations
- Entrance animations for sections
- Button press animations
- Card hover/press effects
- Modal slide animations

### 12. Add Empty States
- Custom illustrations for empty portfolio, education, work
- Friendly copy encouraging users to add content

## File Structure
Total estimated lines: ~1200-1400 (current: 541)

This is a comprehensive enhancement following best practices from EditProfileScreen (freelancer).

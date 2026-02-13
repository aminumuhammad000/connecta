import * as storage from './storage';
import { useEffect, useState, useCallback } from 'react';

type Language = 'en' | 'ha';

const translations = {
    en: {
        find_freelancers: 'Find the Best People',
        find_freelancers_sub: 'Connect with talented people who are ready to help bring your ideas to life.',
        secure_payments: 'Your Money is Safe',
        secure_payments_sub: 'We keep your payments secure. You only pay when you\'re happy with the work.',
        manage_projects: 'A Better Way to Work',
        manage_projects_sub: 'Everything you need to work together, all in one friendly place.',
        get_started: 'Let\'s Get Started',
        next: 'Next',
        skip: 'Skip',
        continue: 'Continue',
        expert_count: '15k+',
        experts_label: 'Trusted Experts',
        protection_label: 'Safe Payments',
        support_label: 'Here to Help',
        welcome_title: 'Welcome! Ready to do great work?',
        tagline_1: 'The friendly place\nfor professionals.',
        tagline_2: 'Find great talent\neasily & securely.',
        tagline_3: 'Work your own way,\nget paid on time.',
        tagline_4: 'Build your dream team\ntoday.',
        login: 'Log In',
        create_account: 'Join Us',
        legal_text: 'Privacy • Terms',
        login_header: 'Welcome back!',
        login_sub: 'Good to see you again. Let\'s get you signed in.',
        signup_header: 'Hi there!',
        signup_sub: 'We\'re excited to have you join our community.',
        email: 'Email Address',
        password: 'Password',
        forgot_password: 'Forgot Password?',
        dont_have_account: 'New here?',
        already_have_account: 'Already have an account?',
        sign_up: 'Join Connecta',
        sign_in: 'Sign In',
        full_name: 'What should we call you?',
        verifying: 'Just a second...',
        // Signup Details
        final_steps: 'Let\'s stay in touch!',
        security_requirement: 'To keep everyone safe, we just need a quick look at your email and phone number.',
        upload_photo: 'Pick a nice photo',
        phone_number: 'Your Phone Number',
        photo_required: 'Photo Needed',
        photo_req_msg: 'Please add a photo so people can recognize you!',
        invalid_phone: 'Check your number',
        invalid_phone_msg: 'That phone number doesn\'t look quite right. Can you check it?',
        // Location
        where_based: 'Where are you living?',
        location_sub: 'We use this to show you the best local opportunities and build trust.',
        country: 'Country',
        city: 'City',
        timezone: 'Local Time',
        kano_trust: 'We have special verification for Kano!',
        complete_setup: 'Done! Let\'s Go',
        agreements: 'The Legal Stuff',
        i_agree_terms: 'I agree to the Terms',
        i_consent_privacy: 'I\'m okay with the Privacy Policy',
        legal_req: 'Wait a moment',
        legal_req_msg: 'Please take a look at our legal terms and accept them to continue.',
        // OTP
        verify_email: 'Check your email!',
        otp_sub: "We just sent a 4-digit code to",
        verify_code: 'Confirm Code',
        resend_code: 'Resend it',
        resend_in: 'Resend in',
        didnt_receive: "Didn't get the code?",
        email_verified_success: 'All set! Your email is verified.',
        // Role Selection
        role_title: 'What would you like to do?',
        role_subtitle: 'Select the role that best describes your goals on Connecta.',
        i_want_to_hire: 'I want to hire talent',
        i_want_to_hire_sub: 'I have projects and I\'m looking for the best kwararru (experts) to get them done.',
        i_want_to_work: 'I want to work',
        i_want_to_work_sub: 'I\'m a skilled professional looking for great opportunities and secure payments.',
        // Language Select
        lang_greet: 'Hey! 👋',
        lang_select_title: 'Which language do you prefer?',
        lang_select_sub: 'Choosing your language helps us give you the best experience.',
        change_later: "Don't worry, you can always change this later in Settings.",
        // Forgot Password
        forgot_header: 'Forgot Password?',
        forgot_sub: 'No worries! Enter your email and we\'ll send you a verification code.',
        send_code: 'Send Code',
        back_to_login: 'Back to Login',
        remember_password: 'Remember your password?',
        // Reset Password
        reset_header: 'New Beginnings',
        reset_sub: 'Let\'s get your account back with a fresh password.',
        reset_btn: 'Reset Password',
        resetting: 'Resetting...',
        pass_req: 'Password must contain:',
        min_chars: 'At least 8 characters',
        pass_match: 'Passwords match',
        confirm_new_pass: 'Confirm New Password',
        // Common
        error: 'Error',
        success: 'Success',
        wait: 'Wait!',
        oops: 'Oops!',
        almost: 'Almost there!',
        password_chat_title: 'Keep it safe! 🔒',
        password_chat_title_personalized: 'Keep it safe, {{name}}! 🔒',
        password_chat_sub: "Choose a password you'll won't forget. Don't worry, it's just between us.",
        // Entity Selection
        entity_title: 'How do you want to operate?',
        entity_sub: 'Choose how you want to present yourself.',
        individual: 'Individual',
        individual_desc_freelancer: 'I am a freelancer working on my own.',
        individual_desc_client: "I am hiring for personal projects.",
        team: 'Team / Organization',
        team_desc_freelancer: 'We are an agency or team of experts.',
        team_desc_client: "I am hiring for a company.",
        // Work Type
        work_type_title: 'What type of work are you looking for?',
        work_type_sub: "We'll curate jobs based on your preference.",
        remote_only: 'Remote Only',
        hybrid: 'Hybrid',
        onsite: 'On-site',
        remote_desc: "Work from anywhere",
        hybrid_desc: "Mix of home & office",
        onsite_desc: "Work at an office",

        // Industry Selection
        industry_title: 'Which industry best describes your skills?',
        // Roles Selection
        roles_title: 'Select specific roles',
        roles_sub: 'Select up to 5 that apply to you',
        // WhatsApp
        whatsapp_title: 'Are you on WhatsApp?',
        whatsapp_sub: 'Add your number to receive instant job alerts (Optional).',
        // Matching Screen
        gathering_jobs: 'Gathering jobs for you...',
        analyzing_profile: 'Analyzing your profile...',
        found_opportunities: 'Found amazing opportunities!',
        personalizing_dashboard: 'Personalizing your experience...',
        jobs_found: 'Jobs Found',
        start_exploring: "Let's Start Exploring Jobs",
        // Rewards
        rewards_earned: 'Rewards Earned! 🎉',
        sparks_earned: 'Sparks Earned',
        rewards_help: 'Your reward score helps you get priority job notifications and better matches!',
        congratulations: 'Congratulations! 🎉',
        engagement_tip: 'Stay active daily and engage with jobs to earn more rewards and boost your visibility!',
        // Profile Completion
        complete_profile_title: 'Complete Your Profile',
        complete_profile_sub: 'Unlock all features',
        completed: 'Completed',
        earn_reward: 'Earn',
        missing_fields: 'Complete these sections:',
        more: 'more',
        complete_now: 'Complete Profile Now',
        bio: 'Bio / Description',
        skills: 'Skills',
        location: 'Location',
        profile_picture: 'Profile Picture',
        phone: 'Phone Number',
        experience: 'Work Experience',
        education: 'Education',
        portfolio: 'Portfolio',
        rewards_benefit: 'Complete your profile to earn rewards! Rewards help you get priority job match emails, WhatsApp notifications, and other important updates.',

        // Dashboard
        welcome_back: 'Welcome back',
        active_proposals: 'Active Proposals',
        completed_jobs: 'Completed Jobs',
        total_earnings: 'Total Earnings',
        quick_actions: 'Quick Actions',
        my_jobs: 'My Jobs',
        proposals: 'Proposals',
        wallet: 'Wallet',
        messages: 'Messages',
        recommended_jobs: 'Jobs You Might Like',
        view_all: 'View All',
        no_jobs_found: 'No recommended jobs found',
        apply_now: 'Apply Now',
        fixed_price: 'Fixed Price',
        hourly: 'Hourly',
    },
    ha: {
        find_freelancers: 'Nemi Kwararrun Mutane',
        find_freelancers_sub: 'Hadu da hazikan ma\'aikata wadanda suke shirye su taimaka maka wajen gudanar da ayyukanka.',
        secure_payments: 'Kudinka Yana nan Lafiya',
        secure_payments_sub: 'Muna kiyaye kudadenka. Sai ka gamsu da aikin sannan muke tura kudin.',
        manage_projects: 'Hanya Mafi Kyau don Yin Aiki',
        manage_projects_sub: 'Duk abin da kake bukata don yin aiki tare, duk a wuri guda mai sauki.',
        get_started: 'Mu Fara Yanzu',
        next: 'Gaba',
        skip: 'Tsallake',
        expert_count: '15k+',
        experts_label: 'Amintattun Kwararru',
        protection_label: 'Kariya ga Biyan Kudi',
        support_label: 'Muna nan don Taimaka Maka',
        welcome_title: 'Sannu da zuwa! Shin kana shirye don babban aiki?',
        tagline_1: 'Wuri ne mai kyau\ndon kwararrun ma\'aikata.',
        tagline_2: 'Dauki ma\'aikata\ncikin sauki da aminci.',
        tagline_3: 'Yi aiki yadda kake so,\nkuma a biya ka a kan lokaci.',
        tagline_4: 'Gina kungiyar da kake so\na yau.',
        login: 'Shiga',
        create_account: 'Kasance tare da mu',
        legal_text: 'Tsaro • Sharudda',
        login_header: 'Barka da dawowa!',
        login_sub: 'Muna farin cikin ganinka kuma. Bari mu shigar da kai.',
        signup_header: 'Sannunka!',
        signup_sub: 'Muna farin cikin kasancewarka tare da mu a wannan al\'umma.',
        email: 'Adireshin Imel',
        password: 'Kalmar Sirri',
        forgot_password: 'Ka manta kalmar sirri?',
        dont_have_account: 'Sabon shiga ne?',
        already_have_account: 'Kana da account?',
        sign_up: 'Shiga Connecta',
        sign_in: 'Shiga',
        full_name: 'Mene ne sunan ka?',
        verifying: 'Dakata kadan...',
        // Signup Details
        final_steps: 'Bari mu kasance da alaka!',
        security_requirement: 'Domin tun tubar ka muna bukatar ganin imel dinka da lambar wayarka.',
        upload_photo: 'Saka hoto mai kyau',
        phone_number: 'Lambar Wayarka',
        photo_required: 'Ana Bukatar Hoto',
        photo_req_msg: 'Don Allah saka hoto don mutane su gane ka!',
        invalid_phone: 'Duba lambarka',
        invalid_phone_msg: 'Wannan lambar wayar ba ta yi daidai ba. Za ka iya dubawa?',
        // Location
        where_based: 'A ina kake da zama?',
        location_sub: 'Muna amfani da wannan don nuna maka damammaki mafi kyau da kuma gina amana.',
        country: 'Kasa',
        city: 'Gari',
        timezone: 'Lokacin Gida',
        kano_trust: 'Muna da tabbatar da amana na musamman a Kano!',
        complete_setup: 'Shi ke nan! Mu tafi',
        agreements: 'Abubuwan Sharudda',
        i_agree_terms: 'Na yarda da Sharuddan',
        i_consent_privacy: 'Na yarda da Manufar Tsaro',
        legal_req: 'Dakata kadan',
        legal_req_msg: 'Don Allah duba sharuddanmu kuma ka karbe su don mu ci gaba.',
        // OTP
        verify_email: 'Duba imel dinka!',
        otp_sub: "Mun aiko da lambobi 4 zuwa",
        verify_code: 'Tabbatar da Lambobi',
        resend_code: 'Sake tura shi',
        resend_in: 'Sake tura a bayan',
        didnt_receive: "Ba ka sami lambobin ba?",
        email_verified_success: 'An kammala! Mun tantance imel dinka.',
        // Role Selection
        role_title: 'Me kake so ka yi?',
        role_subtitle: 'Zabi bangaren da ya dace da burinka a Connecta.',
        i_want_to_hire: 'Ina so in dauki ma\'aikata',
        i_want_to_hire_sub: 'Ina da ayyuka kuma ina neman kwararru mafi kyau don gudanar da su.',
        i_want_to_work: 'Ina so in yi aiki',
        i_want_to_work_sub: 'Ni kwararre ne mai neman damammaki masu kyau da kuma biya amintacce.',
        // Language Select
        lang_greet: 'Sannu! 👋',
        lang_select_title: 'Wanne yare kake so?',
        lang_select_sub: 'Zabar yare yana taimaka mana mu ba ka mafi kyawun kwarewa.',
        change_later: 'Kada ka damu, za ka iya canza wannan daga baya a Saituna.',
        // Forgot Password
        forgot_header: 'Ka manta kalmar sirri?',
        forgot_sub: 'Kada ka damu! Shigar da adireshin imel dinka sannan za mu tura maka lambar tabbatarwa.',
        send_code: 'Tura lambar tabbatarwa',
        back_to_login: 'Koma wurin Shiga',
        remember_password: 'Ka tuna kalmar sirri dinka?',
        // Reset Password
        reset_header: 'Sabuwar Farawa',
        reset_sub: 'Bari mu dawo maka da akantinka tare da sabuwar kalmar sirri.',
        reset_btn: 'Sake saita Kalmar Sirri',
        resetting: 'Ana sake saiti...',
        pass_req: 'Kalmar sirri dole ta kasance:',
        min_chars: 'A kalla haruffa 8',
        pass_match: 'Kalmomin sirri sun yi daidai',
        confirm_new_pass: 'Tabbatar da Sabuwar Kalmar Sirri',
        password_chat_title: 'Adana shi lafiya! 🔒',
        password_chat_title_personalized: 'Adana shi lafiya, {{name}}! 🔒',
        password_chat_sub: "Zabi kalmar sirri da ba za ka manta ba. Kada ka damu, tsakaninmu ne kawai.",
        // Common
        error: 'Kuskure',
        success: 'Nasarar',
        wait: 'Dakata!',
        oops: 'Kash!',
        almost: 'Kusa gama!',
        continue: 'Ci gaba',
        // Entity Selection
        entity_title: 'Yaya kake so ka yi aiki?',
        entity_sub: 'Zabi yadda kake so ka gabatar da kanka.',
        individual: 'Mutum Daya',
        individual_desc_freelancer: 'Ni dan kwangila ne mai zaman kansa.',
        individual_desc_client: "Ina daukar ma'aikata don ayyukan kashin kaina.",
        team: 'Kungiya / Kamfani',
        team_desc_freelancer: 'Mu kungiya ce ta kwararru.',
        team_desc_client: "Ina daukar ma'aikata don kamfani.",
        // Work Type
        work_type_title: 'Wanne irin aiki kake nema?',
        work_type_sub: 'Za mu tanadi ayyuka bisa ga abin da kake so.',
        remote_only: 'Yi Aiki Daga Gida',
        hybrid: 'Duka (Gida da Ofis)',
        onsite: 'A Ofis',
        remote_desc: "Yi aiki daga ko'ina",
        hybrid_desc: 'Hada gida da ofis',
        onsite_desc: 'Yi aiki a ofis',
        // Industry Selection
        industry_title: 'Wanne bangare ne ya fi dacewa da kwarewarka?',
        // Roles Selection
        roles_title: 'Zabi takamaiman ayyukan da kake yi',
        roles_sub: 'Zabi har guda 5 wadanda suka shafe ka',
        // WhatsApp
        whatsapp_title: 'Kana amfani da WhatsApp?',
        whatsapp_sub: 'Saka lambarka don samun sanarwar ayyuka nan take (Ba dole ba ne).',
        // Matching Screen
        gathering_jobs: 'Ina tattara ayyuka maka...',
        analyzing_profile: 'Ina nazarin bayaninka...',
        found_opportunities: 'Na samo damammaki masu kyau!',
        personalizing_dashboard: 'Ina kera kwarewarku...',
        jobs_found: 'Ayyuka da aka Samu',
        start_exploring: 'Mu Fara Gano Ayyuka',
        // Rewards
        rewards_earned: 'Ka Samu Lada! 🎉',
        sparks_earned: 'Sparks da ka Samu',
        rewards_help: 'Ladan naka zai taimaka maka samun sanarwar ayyuka na farko da ingantattun ayyuka!',
        congratulations: 'Barka da Nasara! 🎉',
        engagement_tip: 'Kasance mai aiki kowane rana kuma shige cikin ayyuka don samun karin lada da kara girman ka!',
        // Profile Completion
        complete_profile_title: 'Cika Bayanin Martabarka',
        complete_profile_sub: 'Bude dukkan ayyuka',
        completed: 'An Cika',
        earn_reward: 'Samu',
        missing_fields: 'Cika wadannan sassa:',
        more: 'kari',
        complete_now: 'Cika Bayanin Yanzu',
        bio: 'Bayani / Tarihi',
        skills: 'Kwarewa',
        location: 'Wuri / Gari',
        profile_picture: 'Hoton Martaba',
        phone: 'Lambar Waya',
        experience: 'Kwarewar Aiki',
        education: 'Ilimi',
        portfolio: 'Ayyukan da ka yi',
        rewards_benefit: 'Cika bayanin martabarka don samun lada! Lada zai taimaka maka samun sanarwar ayyuka na farko ta imel, WhatsApp, da sauran muhimman bayanan.',

        // Dashboard
        welcome_back: 'Barka da zuwa',
        active_proposals: 'Shawarwarin da Suke Aiki',
        completed_jobs: 'Ayyukan da ka Kammala',
        total_earnings: 'Jimlar Kudin da ka Samu',
        quick_actions: 'Ayyuka Masu Sauri',
        my_jobs: 'Ayyukana',
        proposals: 'Shawarwari',
        wallet: 'Jaka',
        messages: 'Sakonnin',
        recommended_jobs: 'Ayyukan da suka dace da kai',
        view_all: 'Duba Duka',
        no_jobs_found: 'Ba a sami ayyukan ba',
        apply_now: 'Nema Yanzu',
        fixed_price: 'Tsayayyen Kudin',
        hourly: 'Na Sa\'a',
    }
};

export const useTranslation = () => {
    const [lang, setLang] = useState<Language>('en');

    useEffect(() => {
        const loadLang = async () => {
            const savedLang = await storage.getItem('PREFERRED_LANGUAGE');
            if (savedLang === 'ha' || savedLang === 'en') {
                setLang(savedLang as Language);
            }
        };
        loadLang();
    }, []);

    const changeLanguage = useCallback(async (newLang: Language) => {
        setLang(newLang);
        await storage.setItem('PREFERRED_LANGUAGE', newLang);
    }, []);

    const t = (key: keyof typeof translations['en']) => {
        return translations[lang][key] || translations['en'][key];
    };

    return { t, lang, changeLanguage };
};

export const useLanguage = () => {
    const [lang, setLang] = useState<Language>('en');

    useEffect(() => {
        const loadLang = async () => {
            const savedLang = await storage.getItem('PREFERRED_LANGUAGE');
            if (savedLang === 'ha' || savedLang === 'en') {
                setLang(savedLang as Language);
            }
        };
        loadLang();
    }, []);

    const setLanguage = useCallback(async (newLang: Language) => {
        setLang(newLang);
        await storage.setItem('PREFERRED_LANGUAGE', newLang);
    }, []);

    return { language: lang, setLanguage };
};

export default translations;

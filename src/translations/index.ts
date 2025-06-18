
export const translations = {
  en: {
    common: {
      loading: 'Loading...',
      back: 'Back',
      days: 'Days',
      success: 'Success',
      error: 'Error',
      preview: 'Preview'
    },
    welcome: {
      title: 'Transform Education with Real Student Feedback',
      subtitle: 'Empower teachers with actionable insights and support student mental health through our comprehensive platform.',
      freeForStudents: 'Always FREE for students!'
    },
    tagline: {
      studentLead: 'Student-led. Teacher-enhanced. Future-focused.'
    },
    auth: {
      login: 'Login',
      signUp: 'Sign Up',
      signUpNow: 'Sign Up Now',
      email: 'Email',
      password: 'Password',
      fullName: 'Full Name',
      loggingIn: 'Logging In...',
      studentLogin: 'Student Access',
      teacherLogin: 'Teacher Portal'
    },
    features: {
      studentFeedback: {
        title: 'Student Voice',
        description: 'Anonymous feedback system that encourages honest communication and helps improve learning experiences.'
      },
      teacherInsights: {
        title: 'Teacher Insights',
        description: 'Real-time analytics and actionable feedback to enhance teaching methods and student engagement.'
      },
      mentalHealth: {
        title: 'Mental Health Support',
        description: 'Integrated support system connecting students with qualified professionals when they need it most.'
      }
    },
    platform: {
      whySchools: 'Why Schools Choose Our Platform',
      whySchoolsSubtitle: 'Trusted by educators worldwide to improve learning outcomes and student wellbeing',
      studentInsights: 'Student Insights That Matter',
      realTimeAnalytics: 'Real-Time Analytics',
      realTimeAnalyticsDesc: 'Get instant feedback on lesson effectiveness and student engagement levels.',
      mentalHealthMonitoring: 'Mental Health Monitoring',
      mentalHealthMonitoringDesc: 'Early detection and intervention for students who need additional support.',
      privacySecurity: 'Privacy & Security',
      privacySecurityDesc: 'GDPR compliant with enterprise-grade security protecting student data.',
      improvementPercent: '85%',
      improvementTitle: 'Improvement in Student Engagement',
      improvementDesc: 'Schools report significant increases in student participation and learning outcomes.',
      readyToTransform: 'Ready to Transform Your Classroom?',
      readyToTransformDesc: 'Join thousands of educators already using our platform to create better learning experiences.'
    },
    login: {
      teacher: {
        title: 'Teacher Login',
        subtitle: 'Access your teaching dashboard'
      },
      student: {
        title: 'Student Login',
        subtitle: 'Access your learning portal'
      }
    },
    teacher: {
      missingInfo: 'Missing Information',
      activePlan: 'Active {{planType}} plan until {{date}}',
      classDetailsTitle: 'Class Details',
      classDetailsDescription: 'Basic information about your lesson',
      subjectLabel: 'Subject',
      selectSubject: 'Select a subject',
      mathematics: 'Mathematics',
      science: 'Science',
      english: 'English',
      history: 'History',
      geography: 'Geography',
      art: 'Art',
      music: 'Music',
      physicalEducation: 'Physical Education',
      computerScience: 'Computer Science',
      other: 'Other',
      lessonTopicLabel: 'Lesson Topic',
      lessonTopicPlaceholder: 'e.g., Introduction to Algebra',
      descriptionLabel: 'Description (Optional)',
      descriptionPlaceholder: 'Additional notes about the lesson...',
      scheduleDetailsTitle: 'Schedule Details',
      scheduleDetailsDescription: 'When and where the class takes place',
      dateLabel: 'Date',
      timeLabel: 'Time',
      durationLabel: 'Duration',
      '30minutes': '30 minutes',
      '45minutes': '45 minutes',
      '60minutes': '60 minutes',
      '90minutes': '90 minutes',
      '120minutes': '120 minutes',
      schoolLabel: 'School',
      schoolPlaceholder: 'Enter school name',
      classGradeLabel: 'Class/Grade',
      classGradePlaceholder: 'e.g., Grade 5A, Class 10B',
      recurringScheduleTitle: 'Recurring Schedule (Optional)',
      recurringScheduleDescription: 'Create multiple classes automatically',
      makeRecurring: 'Make this a recurring class',
      repeatPatternLabel: 'Repeat Pattern',
      weekly: 'Weekly',
      biweekly: 'Bi-weekly',
      monthly: 'Monthly',
      numberOfClassesLabel: 'Number of Classes',
      endDateLabel: 'End Date (Optional)',
      endDateMustBeAfterStart: 'End date must be after start date',
      previewText: 'This will create {{count}} classes starting from {{date}}, repeating {{pattern}}',
      scheduleMultipleClasses: 'Schedule {{count}} Classes',
      scheduleClass: 'Schedule Class',
      classesScheduledSuccess: '{{count}} classes scheduled successfully!',
      classScheduledSuccess: 'Class scheduled successfully!',
      scheduleClassFailed: 'Failed to schedule class. Please try again.'
    },
    student: {
      fullNamePlaceholder: 'Enter your full name',
      passwordMismatch: 'Password Mismatch',
      passwordsDoNotMatch: 'Passwords do not match',
      signupFailed: 'Signup Failed',
      accountCreated: 'Account Created',
      welcomeToApp: 'Welcome to Lesson Lens',
      accessMentalHealthResources: 'Access mental health resources and support from {{school}}',
      defaultName: 'Student'
    },
    dashboard: {
      mentalHealthSupport: 'Mental Health Support',
      noPsychologists: 'No school psychologists available at this time',
      contactAdmin: 'Please contact your school administrator for assistance'
    },
    admin: {
      subscription: 'Active Subscription'
    },
    chat: {
      chatWithStudent: 'Chat with Student',
      liveChatWithDoctor: 'Live Chat with Doctor',
      anonymous: 'Anonymous',
      connectedWithStudent: 'Connected with {{student}}',
      connectedWithDoctor: 'Connected with {{doctor}}',
      connecting: 'Connecting...',
      waitingForDoctor: 'Waiting for doctor...',
      doctor: 'Doctor'
    },
    performance: {
      filters: 'Performance Filters',
      filtersDesc: 'Filter and analyze performance data',
      school: 'School',
      allSchools: 'All Schools',
      sortBy: 'Sort By',
      overallScore: 'Overall Score',
      totalResponses: 'Total Responses',
      minResponses: 'Minimum Responses',
      topSchools: 'Top Performing Schools',
      schoolPerformance: 'Based on overall feedback scores',
      topTeachers: 'Top Performing Teachers',
      allTeachers: 'All teachers across schools',
      teachersFromSchool: 'Teachers from {{school}}',
      teacher: 'Teacher',
      score: 'Score',
      responses: 'Responses',
      rating: 'Rating'
    },
    upload: {
      bulkSchedule: 'Bulk Schedule Upload',
      csvDescription: 'Upload multiple class schedules at once using a CSV file',
      selectFile: 'Select CSV File',
      csvFormat: 'CSV Format',
      requiredColumns: 'Required columns',
      formatNote: 'Date format: YYYY-MM-DD, Time format: HH:MM (24-hour)',
      processing: 'Processing file...',
      csvOnly: 'Please select a CSV file',
      invalidHeaders: 'Invalid CSV format. Please check required headers.',
      noValidData: 'No valid data found in the file',
      success: 'Upload Successful',
      schedulesUploaded: '{{count}} schedules uploaded successfully',
      failed: 'Upload failed. Please try again.'
    },
    demo: {
      page: {
        title: 'Interactive Platform Demo',
        subtitle: 'Experience the full capabilities of our platform',
        backToHome: 'Back to Home',
        interactivePlatformDemo: 'Interactive Platform Demo',
        pauseDemo: 'Pause Demo',
        playDemo: 'Play Demo'
      },
      keyFeaturesShown: 'Key Features Shown',
      simulation: {
        student: {
          title: 'Student Experience',
          description: 'See how students interact with the platform'
        },
        teacher: {
          title: 'Teacher Dashboard',
          description: 'Explore the teacher management interface'
        },
        mentalHealth: {
          title: 'Mental Health Support',
          description: 'Anonymous support and counseling features'
        }
      },
      features: {
        student: {
          1: 'Anonymous feedback submission',
          2: 'Real-time mood tracking',
          3: 'Secure messaging system',
          4: 'Progress visualization',
          5: 'Multi-language support',
          6: 'Privacy-first design'
        },
        teacher: {
          1: 'Comprehensive analytics dashboard',
          2: 'Real-time feedback monitoring',
          3: 'Student progress tracking',
          4: 'Automated reporting tools',
          5: 'Class management features',
          6: 'Mental health alerts',
          7: 'Communication tools',
          8: 'Data export capabilities'
        },
        mentalHealth: {
          1: 'Anonymous chat support',
          2: 'Licensed professional access',
          3: 'Crisis intervention protocols',
          4: 'Mood tracking tools',
          5: 'Resource library',
          6: 'Confidential scheduling'
        }
      },
      interactiveSimulation: 'Interactive Simulation',
      teacherWorkflow: 'Teacher Workflow',
      fullIntegration: 'Full Integration',
      interactive: {
        student: 'Click through the student interface to see how easy feedback submission works.',
        teacher: 'Experience the complete teacher dashboard with real-time data and insights.',
        integration: 'See how mental health support integrates seamlessly with the educational platform.'
      },
      cta: {
        title: 'Ready to Transform Your School?',
        description: 'Start your free trial today and see the difference our platform can make.',
        startTrial: 'Start Free Trial',
        studentAccess: 'Student Access'
      },
      mockup: {
        drSarahOnline: 'Dr. Sarah Online',
        availableChat: 'Available - Chat',
        identityProtected: 'Your identity is protected',
        conversationsConfidential: 'All conversations are confidential',
        helloSafeSpace: 'Hello! This is a safe space. How can I help you today?',
        drSarah: 'Dr. Sarah',
        feelingOverwhelmed: 'I\'ve been feeling overwhelmed with school lately...',
        anonymousStudent: 'Anonymous Student',
        understandValid: 'I understand. Those feelings are completely valid. Let\'s talk about what\'s been most challenging.',
        typeAnonymousMessage: 'Type your anonymous message...',
        send: 'Send',
        startAnonymousChat: 'Start Anonymous Chat',
        bookAnonymousAppointment: 'Book Anonymous Appointment'
      },
      mentalHealth: {
        schoolPsychologist: 'School Psychologist',
        mrJamesChen: 'Mr. James Chen',
        counselor: 'School Counselor',
        backAt2PM: 'Back at 2 PM',
        upcomingExams: 'It\'s mainly the upcoming exams and keeping up with assignments.',
        studyStrategies: 'Let\'s work on some study strategies and stress management techniques together.',
        selfHelpResources: 'Self-Help Resources',
        moodTracking: 'Mood Tracking',
        crisisSupport: 'Crisis Support: Call 988 or text HELLO to 741741'
      }
    },
    pricing: {
      title: 'Pricing',
      unbeatable: 'Unbeatable',
      value: 'Value',
      mostPopular: 'Most Popular',
      transformSchoolLess: 'Transform Your School for Less Than',
      perTeacherMonth: 'per teacher/month',
      worldClass: 'Get world-class educational feedback technology at an unbeatable price',
      costSavings: 'Cost Savings vs Competitors',
      freeTrial: 'Free Trial',
      supportIncluded: 'Support Included',
      volumeDiscounts: 'Volume Discounts Available',
      moreTeachersMoreSave: 'The more teachers you have, the more you save',
      teachers: 'Teachers',
      standardPrice: 'Standard Price',
      discount: 'Discount',
      teacherPlan: 'Teacher Plan',
      perfectIndividual: 'Perfect for individual teachers',
      bestValue: 'Best Value',
      annual: 'Annual',
      saveExclamation: '2 months free!',
      volumeDiscountsDetails: 'Volume discounts available for 5+ teachers',
      schoolAdmin: 'School Administrator',
      completeTransformation: 'Complete school transformation',
      premium: 'Premium',
      saveThirty: '30% off',
      unbeatablePrice: 'Unbeatable Price',
      lessThanCompetitors: '85% less than competitors while offering more features',
      holidayPause: 'Holiday Pause',
      pauseSubscription: 'Pause your subscription during school holidays at no extra cost',
      maximumRoi: 'Maximum ROI',
      schoolsSeeImprovement: 'Schools see 300% improvement in student engagement within first month',
      readyTransformUnbeatable: 'Ready to Transform Education at an Unbeatable Price?',
      startTrialToday: 'Start your free trial today and see why educators worldwide choose our platform',
      startFreeTrialNow: 'Start Free Trial Now',
      signUpEducator: 'Sign Up as Educator',
      questionsContact: 'Questions? Contact our education specialists',
      unlimitedClasses: 'Unlimited Classes & Students',
      feedbackCollection: 'Advanced Feedback Collection',
      analytics: 'Real-time Analytics & Insights',
      mentalHealth: 'Mental Health Support Integration',
      multiLanguage: 'Multi-language Support',
      schoolWideInsights: 'School-wide Performance Insights',
      teacherManagement: 'Advanced Teacher Management',
      privacyCompliant: 'GDPR & Privacy Compliant',
      startFreeTrial: 'Start Free Trial',
      transformYourSchool: 'Transform Your School'
    }
  },
  lt: {
    // Lithuanian translations would go here
    common: {
      loading: 'Kraunama...',
      back: 'Atgal',
      days: 'Dienos',
      success: 'Sėkmė',
      error: 'Klaida',
      preview: 'Peržiūra'
    },
    welcome: {
      title: 'Transformuokite švietimą su tikrais mokinių atsiliepimais',
      subtitle: 'Suteikite mokytojams veiksmingų įžvalgų ir palaikykite mokinių psichikos sveikatą per mūsų išsamią platformą.',
      freeForStudents: 'Visada NEMOKAMA mokiniams!'
    },
    tagline: {
      studentLead: 'Mokinių vadovaujama. Mokytojų tobulinama. Ateičiai orientuota.'
    },
    auth: {
      login: 'Prisijungti',
      signUp: 'Registruotis',
      signUpNow: 'Registruotis dabar',
      email: 'El. paštas',
      password: 'Slaptažodis',
      fullName: 'Pilnas vardas',
      loggingIn: 'Prisijungiama...',
      studentLogin: 'Mokinio prieiga',
      teacherLogin: 'Mokytojo portalas'
    },
    features: {
      studentFeedback: {
        title: 'Mokinių balsas',
        description: 'Anoniminė atsiliepimų sistema, skatinanti sąžiningą bendravimą ir padedanti gerinti mokymosi patirtį.'
      },
      teacherInsights: {
        title: 'Mokytojų įžvalgos',
        description: 'Realaus laiko analitika ir veiksmingi atsiliepimai, gerinantys mokymo metodus ir mokinių įsitraukimą.'
      },
      mentalHealth: {
        title: 'Psichikos sveikatos palaikymas',
        description: 'Integruota palaikymo sistema, jungianti mokinius su kvalifikuotais specialistais, kai jie to labiausiai reikia.'
      }
    },
    platform: {
      whySchools: 'Kodėl mokyklos renkasi mūsų platformą',
      whySchoolsSubtitle: 'Patikima švietimo specialistų visame pasaulyje mokymosi rezultatų ir mokinių gerovės gerinimui',
      studentInsights: 'Svarbios mokinių įžvalgos',
      realTimeAnalytics: 'Realaus laiko analitika',
      realTimeAnalyticsDesc: 'Gaukite tiesioginius atsiliepimus apie pamokų efektyvumą ir mokinių įsitraukimo lygį.',
      mentalHealthMonitoring: 'Psichikos sveikatos stebėjimas',
      mentalHealthMonitoringDesc: 'Ankstyvasis aptikimas ir intervencija mokiniams, kuriems reikia papildomo palaikymo.',
      privacySecurity: 'Privatumas ir saugumas',
      privacySecurityDesc: 'GDPR atitinkanti su įmonės lygio saugumu, saugančiu mokinių duomenis.',
      improvementPercent: '85%',
      improvementTitle: 'Pagerėjimas mokinių įsitraukime',
      improvementDesc: 'Mokyklos praneša apie reikšmingą mokinių dalyvavimo ir mokymosi rezultatų padidėjimą.',
      readyToTransform: 'Pasiruošę transformuoti savo klasę?',
      readyToTransformDesc: 'Prisijunkite prie tūkstančių švietimo specialistų, jau naudojančių mūsų platformą geresnei mokymosi patirčiai kurti.'
    },
    login: {
      teacher: {
        title: 'Mokytojo prisijungimas',
        subtitle: 'Prieiga prie mokymo skydelio'
      },
      student: {
        title: 'Mokinio prisijungimas',
        subtitle: 'Prieiga prie mokymosi portalo'
      }
    },
    teacher: {
      missingInfo: 'Trūksta informacijos',
      activePlan: 'Aktyvus {{planType}} planas iki {{date}}'
    },
    student: {
      fullNamePlaceholder: 'Įveskite pilną vardą',
      passwordMismatch: 'Slaptažodžiai nesutampa',
      passwordsDoNotMatch: 'Slaptažodžiai nesutampa',
      signupFailed: 'Registracija nepavyko',
      accountCreated: 'Paskyra sukurta',
      welcomeToApp: 'Sveiki atvykę į Lesson Lens',
      accessMentalHealthResources: 'Prieiga prie psichikos sveikatos išteklių ir palaikymo iš {{school}}',
      defaultName: 'Mokinys'
    },
    dashboard: {
      mentalHealthSupport: 'Psichikos sveikatos palaikymas',
      noPsychologists: 'Šiuo metu nėra mokyklos psichologų',
      contactAdmin: 'Kreipkitės į mokyklos administratorių dėl pagalbos'
    },
    admin: {
      subscription: 'Aktyvi prenumerata'
    },
    chat: {
      chatWithStudent: 'Pokalbis su mokiniu',
      liveChatWithDoctor: 'Tiesioginiai pokalbiai su gydytoju',
      anonymous: 'Anoniminis',
      connectedWithStudent: 'Prisijungta su {{student}}',
      connectedWithDoctor: 'Prisijungta su {{doctor}}',
      connecting: 'Jungiamasi...',
      waitingForDoctor: 'Laukiama gydytojo...',
      doctor: 'Gydytojas'
    },
    demo: {
      page: {
        title: 'Interaktyvi platformos demonstracija',
        subtitle: 'Išbandykite visas mūsų platformos galimybes',
        backToHome: 'Atgal į pradžią',
        interactivePlatformDemo: 'Interaktyvi platformos demonstracija',
        pauseDemo: 'Pristabdyti demonstraciją',
        playDemo: 'Paleisti demonstraciją'
      },
      keyFeaturesShown: 'Pagrindinės funkcijos',
      simulation: {
        student: {
          title: 'Mokinio patirtis',
          description: 'Pažiūrėkite, kaip mokiniai naudojasi platforma'
        },
        teacher: {
          title: 'Mokytojo skydelis',
          description: 'Išbandykite mokytojo valdymo sąsają'
        },
        mentalHealth: {
          title: 'Psichikos sveikatos palaikymas',
          description: 'Anoniminio palaikymo ir konsultavimo funkcijos'
        }
      }
    },
    pricing: {
      title: 'Kainodara'
    }
  }
};

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextProps {
  language: 'en' | 'lt';
  setLanguage: (lang: 'en' | 'lt') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

const translations = {
  en: {
    welcome: {
      title: "Lessons Learnt: Personalized Education for Every Student",
      subtitle: "Empowering students and teachers with AI-driven insights and mental health support."
    },
    auth: {
      studentLogin: "Login as Student",
      teacherLogin: "Login as Teacher"
    },
    tagline: {
      studentLead: "Where students lead and innovation lights the way."
    },
    features: {
      studentFeedback: {
        title: "AI-Driven Student Feedback",
        description: "Collect and analyze student feedback in real-time to improve teaching methods and curriculum."
      },
      teacherInsights: {
        title: "Teacher Insights & Analytics",
        description: "Gain actionable insights into student performance and engagement with comprehensive analytics dashboards."
      },
      mentalHealth: {
        title: "Mental Health Support",
        description: "Provide students with access to mental health resources and support through a secure and confidential platform."
      }
    },
    platform: {
      whySchools: "Why Lessons Learnt for Your School?",
      whySchoolsSubtitle: "Transform your educational environment with data-driven insights and comprehensive support for students and teachers.",
      studentInsights: "Unlock Student Potential with Data-Driven Insights",
      realTimeAnalytics: "Real-Time Analytics",
      realTimeAnalyticsDesc: "Monitor student performance and engagement in real-time to identify areas for improvement.",
      mentalHealthMonitoring: "Mental Health Monitoring",
      mentalHealthMonitoringDesc: "Provide early intervention and support for students' mental health needs through proactive monitoring.",
      privacySecurity: "Privacy & Security",
      privacySecurityDesc: "Ensure the privacy and security of student data with our secure and compliant platform.",
      improvementPercent: "30%",
      improvementTitle: "Improvement in Student Outcomes",
      improvementDesc: "Schools using Lessons Learnt have seen a 30% improvement in student outcomes and engagement.",
      readyToTransform: "Ready to Transform Your School?",
      readyToTransformDesc: "Schedule a demo to learn how Lessons Learnt can revolutionize your educational environment."
    },
    demo: {
      subtitle: "Explore our platform's key features with interactive demos tailored for students, teachers, and psychologists.",
      exploreFeatures: "Explore Key Features",
      liveVoiceover: "Live Voiceover:",
      userType: {
        student: "Student",
        teacher: "Teacher",
        psychologist: "Psychologist"
      },
      studentFeedback: {
        title: "Student Feedback",
        description: "Collect real-time feedback from students to improve teaching methods.",
        voiceover: "Explore how students can provide instant feedback on lessons, helping teachers adapt and improve their teaching methods in real-time."
      },
      teacherInsights: {
        title: "Teacher Insights",
        description: "Gain insights into student performance and engagement.",
        voiceover: "Discover how teachers can access comprehensive analytics dashboards to gain insights into student performance and engagement."
      },
      mentalHealth: {
        title: "Mental Health Support",
        description: "Provide mental health resources and support for students.",
        voiceover: "Learn how students can access mental health resources and support through a secure and confidential platform."
      },
      classManagement: {
        title: "Class Management",
        description: "Manage classes, assignments, and student progress efficiently.",
        voiceover: "See how teachers can efficiently manage classes, assignments, and track student progress using our intuitive class management tools."
      },
      liveChat: {
        title: "Live Chat",
        description: "Enable real-time communication between students and teachers.",
        voiceover: "Experience real-time communication between students and teachers, fostering a collaborative learning environment."
      },
      compliance: {
        gdpr: "GDPR Compliant",
        soc2: "SOC 2 Certified",
        hipaa: "HIPAA Compliant",
        description: "We are committed to data privacy and security. Our platform is fully compliant with GDPR, SOC 2, and HIPAA regulations."
      },
      stats: {
        coreFeatures: "Core Features",
        userTypes: "User Types",
        mentalHealthSupport: "24/7 Mental Health Support"
      },
      mockups: {
        studentFeedback: {
          title: "Student Feedback",
          live: "Live",
          rating: "Excellent lesson!",
          subject: "Mathematics - Algebra",
          comment: "I understood everything clearly. The examples were very helpful.",
          understood: "I understood this lesson",
          excellent: "Excellent",
          anonymous: "Submit feedback anonymously"
        },
        mentalHealth: {
          title: "Mental Health Support",
          available: "24/7 Available",
          anonymous: "100% Anonymous & Confidential",
          description: "Safe space to share feelings and get support from qualified professionals.",
          support: "Professional Support",
          psychologist: "Licensed school psychologist",
          chat: "Instant Chat Support",
          immediate: "Get immediate help when needed"
        },
        classManagement: {
          title: "Today's Schedule",
          grade: "Grade 8A",
          math: "Mathematics",
          mathTopic: "Algebra & Linear Equations",
          mathTime: "9:00 AM - 10:30 AM",
          current: "Current",
          science: "Science Lab",
          scienceTopic: "Chemical Reactions & Experiments",
          scienceTime: "11:00 - 12:30",
          next: "Next",
          lunch: "Lunch Break",
          lunchDesc: "Free time for students",
          lunchTime: "1:00 PM - 2:00 PM"
        },
        teacherDashboard: {
          title: "Class Performance Analytics",
          live: "Live Data",
          understanding: "Average Understanding",
          improvement: "↑ 5% from last week",
          students: "Active Students",
          attendance: "100% attendance today",
          mathClass: "Math Class - Period 3",
          mathTopic: "Algebra & Functions",
          mathUnderstood: "92% understood",
          scienceClass: "Science Lab - Period 5",
          scienceTopic: "Chemical Reactions",
          scienceUnderstood: "89% understood"
        },
        liveChat: {
          title: "Live Class Chat",
          online: "Online",
          teacherMessage: "Great question! Let me explain this concept step by step...",
          studentMessage: "Can you clarify the third step?",
          teacherReply: "Of course! The key is to isolate the variable first.",
          now: "now",
          placeholder: "Type your question..."
        }
      }
    }
  },
  lt: {
    welcome: {
      title: "Pamokos Išmoktos: Individualizuotas ugdymas kiekvienam mokiniui",
      subtitle: "Suteikiame galių mokiniams ir mokytojams naudojant dirbtinio intelekto įžvalgas ir psichikos sveikatos palaikymą."
    },
    auth: {
      studentLogin: "Prisijungti kaip mokinys",
      teacherLogin: "Prisijungti kaip mokytojas"
    },
    tagline: {
      studentLead: "Čia mokiniai vadovauja, o inovacijos nušviečia kelią."
    },
    features: {
      studentFeedback: {
        title: "Dirbtinio intelekto pagrindu veikiantys mokinių atsiliepimai",
        description: "Rinkite ir analizuokite mokinių atsiliepimus realiuoju laiku, kad patobulintumėte mokymo metodus ir mokymo programą."
      },
      teacherInsights: {
        title: "Mokytojų įžvalgos ir analizė",
        description: "Gaukite praktinių įžvalgų apie mokinių rezultatus ir įsitraukimą naudodami išsamias analizės prietaisų skydelius."
      },
      mentalHealth: {
        title: "Psichikos sveikatos palaikymas",
        description: "Suteikite mokiniams prieigą prie psichikos sveikatos išteklių ir palaikymo per saugią ir konfidencialią platformą."
      }
    },
    platform: {
      whySchools: "Kodėl Pamokos Išmoktos jūsų mokyklai?",
      whySchoolsSubtitle: "Pakeiskite savo ugdymo aplinką naudodami duomenimis pagrįstas įžvalgas ir visapusišką paramą mokiniams ir mokytojams.",
      studentInsights: "Atraskite mokinių potencialą naudodami duomenimis pagrįstas įžvalgas",
      realTimeAnalytics: "Realaus laiko analizė",
      realTimeAnalyticsDesc: "Stebėkite mokinių rezultatus ir įsitraukimą realiuoju laiku, kad nustatytumėte tobulintinas sritis.",
      mentalHealthMonitoring: "Psichikos sveikatos stebėjimas",
      mentalHealthMonitoringDesc: "Užtikrinkite ankstyvą intervenciją ir paramą mokinių psichikos sveikatos poreikiams, vykdydami aktyvų stebėjimą.",
      privacySecurity: "Privatumas ir saugumas",
      privacySecurityDesc: "Užtikrinkite mokinių duomenų privatumą ir saugumą naudodami mūsų saugią ir reikalavimus atitinkančią platformą.",
      improvementPercent: "30%",
      improvementTitle: "Mokinių rezultatų pagerėjimas",
      improvementDesc: "Mokyklos, naudojančios Pamokos Išmoktos, pastebėjo 30% mokinių rezultatų ir įsitraukimo pagerėjimą.",
      readyToTransform: "Pasirengę pakeisti savo mokyklą?",
      readyToTransformDesc: "Suplanuokite demonstraciją, kad sužinotumėte, kaip Pamokos Išmoktos gali iš esmės pakeisti jūsų ugdymo aplinką."
    },
    demo: {
      subtitle: "Naršykite pagrindines mūsų platformos funkcijas naudodami interaktyvias demonstracijas, pritaikytas studentams, mokytojams ir psichologams.",
      exploreFeatures: "Naršyti pagrindines funkcijas",
      liveVoiceover: "Tiesioginis balso perdavimas:",
      userType: {
        student: "Studentas",
        teacher: "Mokytojas",
        psychologist: "Psichologas"
      },
      studentFeedback: {
        title: "Mokinių atsiliepimai",
        description: "Rinkite realaus laiko atsiliepimus iš mokinių, kad patobulintumėte mokymo metodus.",
        voiceover: "Sužinokite, kaip mokiniai gali teikti tiesioginius atsiliepimus apie pamokas, padėdami mokytojams prisitaikyti ir tobulinti savo mokymo metodus realiuoju laiku."
      },
      teacherInsights: {
        title: "Mokytojų įžvalgos",
        description: "Gaukite įžvalgų apie mokinių rezultatus ir įsitraukimą.",
        voiceover: "Atraskite, kaip mokytojai gali pasiekti išsamius analizės prietaisų skydelius, kad gautų įžvalgų apie mokinių rezultatus ir įsitraukimą."
      },
      mentalHealth: {
        title: "Psichikos sveikatos palaikymas",
        description: "Teikite psichikos sveikatos išteklius ir paramą mokiniams.",
        voiceover: "Sužinokite, kaip mokiniai gali pasiekti psichikos sveikatos išteklius ir paramą per saugią ir konfidencialią platformą."
      },
      classManagement: {
        title: "Klasės valdymas",
        description: "Efektyviai valdykite klases, užduotis ir mokinių pažangą.",
        voiceover: "Pažiūrėkite, kaip mokytojai gali efektyviai valdyti klases, užduotis ir sekti mokinių pažangą naudodami mūsų intuityvius klasės valdymo įrankius."
      },
      liveChat: {
        title: "Tiesioginis pokalbis",
        description: "Įgalinkite realaus laiko bendravimą tarp mokinių ir mokytojų.",
        voiceover: "Patirkite realaus laiko bendravimą tarp mokinių ir mokytojų, skatinantį bendradarbiavimo mokymosi aplinką."
      },
      compliance: {
        gdpr: "Atitinka GDPR",
        soc2: "SOC 2 sertifikuota",
        hipaa: "Atitinka HIPAA",
        description: "Esame įsipareigoję užtikrinti duomenų privatumą ir saugumą. Mūsų platforma visiškai atitinka GDPR, SOC 2 ir HIPAA reglamentus."
      },
      stats: {
        coreFeatures: "Pagrindinės funkcijos",
        userTypes: "Naudotojų tipai",
        mentalHealthSupport: "24/7 Psichikos sveikatos palaikymas"
      },
      mockups: {
        studentFeedback: {
          title: "Mokinių atsiliepimai",
          live: "Tiesiogiai",
          rating: "Puiki pamoka!",
          subject: "Matematika - Algebra",
          comment: "Viską supratau aiškiai. Pavyzdžiai buvo labai naudingi.",
          understood: "Supratau šią pamoką",
          excellent: "Puiku",
          anonymous: "Pateikti atsiliepimą anonimiškai"
        },
        mentalHealth: {
          title: "Psichikos sveikatos pagalba",
          available: "Prieinama 24/7",
          anonymous: "100% Anonimiška ir konfidenciali",
          description: "Saugi erdvė dalintis jausmais ir gauti kvalifikuotų specialistų pagalbą.",
          support: "Profesionali pagalba",
          psychologist: "Licencijuotas mokyklos psichologas",
          chat: "Momentinė pokalbio pagalba",
          immediate: "Gauti nedelsiant pagalbą, kai reikia"
        },
        classManagement: {
          title: "Šiandienos tvarkaraštis",
          grade: "8A klasė",
          math: "Matematika",
          mathTopic: "Algebra ir tiesiniai lygtys",
          mathTime: "9:00 - 10:30",
          current: "Dabar",
          science: "Gamtos mokslų laboratorija",
          scienceTopic: "Cheminės reakcijos ir eksperimentai",
          scienceTime: "11:00 - 12:30",
          next: "Kitas",
          lunch: "Pietų pertrauka",
          lunchDesc: "Laisvas laikas mokiniams",
          lunchTime: "13:00 - 14:00"
        },
        teacherDashboard: {
          title: "Klasės veiklos analitika",
          live: "Tiesioginis duomenys",
          understanding: "Vidutinis supratimas",
          improvement: "↑ 5% nuo praėjusios savaitės",
          students: "Aktyvūs mokiniai",
          attendance: "100% lankumas šiandien",
          mathClass: "Matematikos pamoka - 3 pamoką",
          mathTopic: "Algebra ir funkcijos",
          mathUnderstood: "92% suprato",
          scienceClass: "Gamtos mokslų laboratorija - 5 pamoka",
          scienceTopic: "Cheminės reakcijos",
          scienceUnderstood: "89% suprato"
        },
        liveChat: {
          title: "Tiesioginis klasės pokalbis",
          online: "Prisijungę",
          teacherMessage: "Puikus klausimas! Leiskite man paaiškinti šią sąvoką žingsnis po žingsnio...",
          studentMessage: "Ar galite paaiškinti trečią žingsnį?",
          teacherReply: "Žinoma! Pagrindas yra pirmiausia izoliuoti kintamąjį.",
          now: "dabar",
          placeholder: "Įveskite savo klausimą..."
        }
      }
    }
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'lt'>((localStorage.getItem('language') as 'en' | 'lt') || 'en');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string) => {
    try {
      const keys = key.split('.');
      let value: any = translations[language];
      for (const k of keys) {
        value = value[k];
        if (!value) {
          console.warn(`Translation not found for key: ${key} in language: ${language}`);
          return key;
        }
      }
      return value || key;
    } catch (error) {
      console.error(`Error translating key: ${key} in language: ${language}`, error);
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

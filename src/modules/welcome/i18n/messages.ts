// Every line the onboarding agent says, and the UI text around it, in each
// language. The conversation is a fixed script, so no AI or translation
// service runs at request time: we just look the text up.
//
// Placeholders like {shopName} are filled in by `fill()`.
//
// NOTE: these were written without a native-speaker review. Have each language
// proofread before launch.

export type LangCode =
  | "hi"
  | "en"
  | "ta"
  | "te"
  | "kn"
  | "ml"
  | "mr"
  | "bn"
  | "gu"
  | "pa";

export type CategoryCode =
  | "grocery"
  | "restaurant"
  | "fashion"
  | "electronics"
  | "pharmacy"
  | "salon"
  | "education"
  | "services"
  | "other";

export type Messages = {
  // What the agent says at each step.
  greet: string;
  askBusiness: string;
  askCity: string;
  askPurpose: string;
  askPhone: string;
  askName: string;
  done: string;
  // Labels used in the summary bubble of the business step.
  nameLabel: string;
  categoryLabel: string;
  // Input texts.
  shopNamePlaceholder: string;
  categoryPlaceholder: string;
  cityPlaceholder: string;
  citySearch: string;
  cityEmpty: string;
  purposePlaceholder: string;
  phonePlaceholder: string;
  namePlaceholder: string;
  send: string;
  required: string;
  invalidPhone: string;
  saveFailed: string;
  retry: string;
  retake: string;
  categories: Record<CategoryCode, string>;
};

// Languages Gnani's voice layer handles best, shown in their own script.
export const LANGUAGES: { code: LangCode; label: string }[] = [
  { code: "hi", label: "हिन्दी" },
  { code: "en", label: "English" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "mr", label: "मराठी" },
  { code: "bn", label: "বাংলা" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
];

export const CATEGORY_CODES: CategoryCode[] = [
  "grocery",
  "restaurant",
  "fashion",
  "electronics",
  "pharmacy",
  "salon",
  "education",
  "services",
  "other",
];

export const MESSAGES: Record<LangCode, Messages> = {
  hi: {
    greet: "नमस्ते!",
    askBusiness:
      "चलिए आपका बिज़नेस सेट करते हैं। आपकी दुकान का नाम क्या है और वह किस तरह का बिज़नेस है?",
    askCity: "आपका बिज़नेस किस शहर में है?",
    askPurpose: "आप इस प्लेटफ़ॉर्म का इस्तेमाल क्यों करना चाहते हैं? अपने शब्दों में बताइए।",
    askPhone: "इस अकाउंट के लिए कृपया अपना फ़ोन नंबर बताइए।",
    askName: "आख़िरी स्टेप: अपने AI कर्मचारी को एक नाम दीजिए।",
    done: "धन्यवाद! {agentName}, {shopName} के लिए तैयार हो रहा है। आपको डैशबोर्ड पर ले जा रहे हैं...",
    nameLabel: "नाम",
    categoryLabel: "श्रेणी",
    shopNamePlaceholder: "दुकान का नाम",
    categoryPlaceholder: "श्रेणी चुनें",
    cityPlaceholder: "शहर चुनें",
    citySearch: "शहर खोजें...",
    cityEmpty: "कोई शहर नहीं मिला।",
    purposePlaceholder: "बताइए आप क्यों इस्तेमाल करना चाहते हैं...",
    phonePlaceholder: "10 अंकों का मोबाइल नंबर",
    namePlaceholder: "जैसे आशा",
    send: "भेजें",
    required: "कृपया यह भरें।",
    invalidPhone: "सही 10 अंकों का मोबाइल नंबर डालें।",
    saveFailed: "सेव नहीं हो सका। फिर कोशिश करें।",
    retry: "फिर कोशिश करें",
    retake: "फिर से शुरू करें",
    categories: {
      grocery: "किराना / ग्रोसरी",
      restaurant: "रेस्टोरेंट / कैफ़े",
      fashion: "कपड़े / फ़ैशन",
      electronics: "इलेक्ट्रॉनिक्स / मोबाइल",
      pharmacy: "दवाई की दुकान",
      salon: "सैलून / ब्यूटी",
      education: "कोचिंग / शिक्षा",
      services: "लोकल सर्विस",
      other: "कुछ और",
    },
  },
  en: {
    greet: "Hello!",
    askBusiness:
      "Let's set up your business. What's your shop name, and what kind of business is it?",
    askCity: "Which city is your business in?",
    askPurpose:
      "Why do you want to use this platform? Tell me in your own words.",
    askPhone: "Please share your phone number for this account.",
    askName: "Last step: give your AI employee a name.",
    done: "Thank you! {agentName} is getting ready for {shopName}. Taking you to your dashboard...",
    nameLabel: "Name",
    categoryLabel: "Category",
    shopNamePlaceholder: "Shop name",
    categoryPlaceholder: "Select category",
    cityPlaceholder: "Select city",
    citySearch: "Search city...",
    cityEmpty: "No city found.",
    purposePlaceholder: "Tell us why you want to use this...",
    phonePlaceholder: "10-digit mobile number",
    namePlaceholder: "e.g. Asha",
    send: "Send",
    required: "Please fill this in.",
    invalidPhone: "Enter a valid 10-digit mobile number.",
    saveFailed: "Couldn't save. Please try again.",
    retry: "Retry",
    retake: "Retake",
    categories: {
      grocery: "Kirana / Grocery",
      restaurant: "Restaurant / Cafe",
      fashion: "Clothing / Fashion",
      electronics: "Electronics / Mobile",
      pharmacy: "Pharmacy / Medical",
      salon: "Salon / Beauty",
      education: "Coaching / Education",
      services: "Local services",
      other: "Something else",
    },
  },
  ta: {
    greet: "வணக்கம்!",
    askBusiness:
      "உங்கள் வணிகத்தை அமைப்போம். உங்கள் கடையின் பெயர் என்ன, அது என்ன வகை வணிகம்?",
    askCity: "உங்கள் வணிகம் எந்த நகரத்தில் உள்ளது?",
    askPurpose: "இந்த தளத்தை ஏன் பயன்படுத்த விரும்புகிறீர்கள்? உங்கள் சொற்களில் சொல்லுங்கள்.",
    askPhone: "இந்தக் கணக்கிற்கான உங்கள் தொலைபேசி எண்ணைப் பகிருங்கள்.",
    askName: "கடைசி படி: உங்கள் AI ஊழியருக்கு ஒரு பெயர் வையுங்கள்.",
    done: "நன்றி! {shopName}-க்காக {agentName} தயாராகிறது. உங்களை டாஷ்போர்டுக்கு அழைத்துச் செல்கிறோம்...",
    nameLabel: "பெயர்",
    categoryLabel: "வகை",
    shopNamePlaceholder: "கடையின் பெயர்",
    categoryPlaceholder: "வகையைத் தேர்ந்தெடுக்கவும்",
    cityPlaceholder: "நகரத்தைத் தேர்ந்தெடுக்கவும்",
    citySearch: "நகரத்தைத் தேடுங்கள்...",
    cityEmpty: "நகரம் எதுவும் இல்லை.",
    purposePlaceholder: "நீங்கள் ஏன் பயன்படுத்த விரும்புகிறீர்கள்...",
    phonePlaceholder: "10 இலக்க மொபைல் எண்",
    namePlaceholder: "எ.கா. ஆஷா",
    send: "அனுப்பு",
    required: "இதை நிரப்பவும்.",
    invalidPhone: "சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.",
    saveFailed: "சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    retry: "மீண்டும் முயற்சி",
    retake: "மீண்டும் தொடங்கு",
    categories: {
      grocery: "மளிகைக் கடை",
      restaurant: "உணவகம் / கஃபே",
      fashion: "ஆடை / ஃபேஷன்",
      electronics: "எலக்ட்ரானிக்ஸ் / மொபைல்",
      pharmacy: "மருந்தகம்",
      salon: "சலூன் / அழகு",
      education: "டியூஷன் / கல்வி",
      services: "உள்ளூர் சேவைகள்",
      other: "வேறு",
    },
  },
  te: {
    greet: "నమస్కారం!",
    askBusiness: "మీ వ్యాపారాన్ని సెట్ చేద్దాం. మీ షాప్ పేరు ఏమిటి, అది ఏ రకమైన వ్యాపారం?",
    askCity: "మీ వ్యాపారం ఏ నగరంలో ఉంది?",
    askPurpose: "మీరు ఈ ప్లాట్‌ఫామ్‌ను ఎందుకు ఉపయోగించాలనుకుంటున్నారు? మీ మాటల్లో చెప్పండి.",
    askPhone: "ఈ ఖాతా కోసం దయచేసి మీ ఫోన్ నంబర్ ఇవ్వండి.",
    askName: "చివరి దశ: మీ AI ఉద్యోగికి ఒక పేరు పెట్టండి.",
    done: "ధన్యవాదాలు! {shopName} కోసం {agentName} సిద్ధమవుతోంది. మిమ్మల్ని డ్యాష్‌బోర్డ్‌కు తీసుకెళ్తున్నాం...",
    nameLabel: "పేరు",
    categoryLabel: "వర్గం",
    shopNamePlaceholder: "షాప్ పేరు",
    categoryPlaceholder: "వర్గాన్ని ఎంచుకోండి",
    cityPlaceholder: "నగరాన్ని ఎంచుకోండి",
    citySearch: "నగరాన్ని వెతకండి...",
    cityEmpty: "నగరం కనబడలేదు.",
    purposePlaceholder: "మీరు ఎందుకు ఉపయోగించాలనుకుంటున్నారో చెప్పండి...",
    phonePlaceholder: "10 అంకెల మొబైల్ నంబర్",
    namePlaceholder: "ఉదా. ఆశా",
    send: "పంపండి",
    required: "దయచేసి ఇది నింపండి.",
    invalidPhone: "సరైన 10 అంకెల మొబైల్ నంబర్ ఇవ్వండి.",
    saveFailed: "సేవ్ చేయడం కుదరలేదు. మళ్లీ ప్రయత్నించండి.",
    retry: "మళ్లీ ప్రయత్నించండి",
    retake: "మళ్లీ ప్రారంభించండి",
    categories: {
      grocery: "కిరాణా దుకాణం",
      restaurant: "రెస్టారెంట్ / కేఫ్",
      fashion: "దుస్తులు / ఫ్యాషన్",
      electronics: "ఎలక్ట్రానిక్స్ / మొబైల్",
      pharmacy: "మెడికల్ షాప్",
      salon: "సెలూన్ / బ్యూటీ",
      education: "కోచింగ్ / విద్య",
      services: "స్థానిక సేవలు",
      other: "ఇతరం",
    },
  },
  kn: {
    greet: "ನಮಸ್ಕಾರ!",
    askBusiness: "ನಿಮ್ಮ ವ್ಯಾಪಾರವನ್ನು ಸೆಟ್ ಮಾಡೋಣ. ನಿಮ್ಮ ಅಂಗಡಿಯ ಹೆಸರೇನು, ಅದು ಯಾವ ರೀತಿಯ ವ್ಯಾಪಾರ?",
    askCity: "ನಿಮ್ಮ ವ್ಯಾಪಾರ ಯಾವ ನಗರದಲ್ಲಿದೆ?",
    askPurpose: "ನೀವು ಈ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಅನ್ನು ಏಕೆ ಬಳಸಲು ಬಯಸುತ್ತೀರಿ? ನಿಮ್ಮ ಮಾತುಗಳಲ್ಲಿ ಹೇಳಿ.",
    askPhone: "ಈ ಖಾತೆಗಾಗಿ ದಯವಿಟ್ಟು ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆ ನೀಡಿ.",
    askName: "ಕೊನೆಯ ಹಂತ: ನಿಮ್ಮ AI ಉದ್ಯೋಗಿಗೆ ಒಂದು ಹೆಸರು ಕೊಡಿ.",
    done: "ಧನ್ಯವಾದಗಳು! {shopName}ಗಾಗಿ {agentName} ಸಿದ್ಧವಾಗುತ್ತಿದೆ. ನಿಮ್ಮನ್ನು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಕರೆದೊಯ್ಯುತ್ತಿದ್ದೇವೆ...",
    nameLabel: "ಹೆಸರು",
    categoryLabel: "ವರ್ಗ",
    shopNamePlaceholder: "ಅಂಗಡಿಯ ಹೆಸರು",
    categoryPlaceholder: "ವರ್ಗ ಆಯ್ಕೆಮಾಡಿ",
    cityPlaceholder: "ನಗರ ಆಯ್ಕೆಮಾಡಿ",
    citySearch: "ನಗರವನ್ನು ಹುಡುಕಿ...",
    cityEmpty: "ಯಾವುದೇ ನಗರ ಸಿಗಲಿಲ್ಲ.",
    purposePlaceholder: "ನೀವು ಏಕೆ ಬಳಸಲು ಬಯಸುತ್ತೀರಿ ಎಂದು ಹೇಳಿ...",
    phonePlaceholder: "10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    namePlaceholder: "ಉದಾ. ಆಶಾ",
    send: "ಕಳುಹಿಸಿ",
    required: "ದಯವಿಟ್ಟು ಇದನ್ನು ತುಂಬಿ.",
    invalidPhone: "ಸರಿಯಾದ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನೀಡಿ.",
    saveFailed: "ಉಳಿಸಲು ಆಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    retry: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    retake: "ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಿ",
    categories: {
      grocery: "ದಿನಸಿ ಅಂಗಡಿ",
      restaurant: "ರೆಸ್ಟೋರೆಂಟ್ / ಕೆಫೆ",
      fashion: "ಬಟ್ಟೆ / ಫ್ಯಾಷನ್",
      electronics: "ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ / ಮೊಬೈಲ್",
      pharmacy: "ಔಷಧಿ ಅಂಗಡಿ",
      salon: "ಸಲೂನ್ / ಬ್ಯೂಟಿ",
      education: "ಕೋಚಿಂಗ್ / ಶಿಕ್ಷಣ",
      services: "ಸ್ಥಳೀಯ ಸೇವೆಗಳು",
      other: "ಇತರೆ",
    },
  },
  ml: {
    greet: "നമസ്കാരം!",
    askBusiness:
      "നമുക്ക് നിങ്ങളുടെ ബിസിനസ് സജ്ജമാക്കാം. നിങ്ങളുടെ കടയുടെ പേര് എന്താണ്, ഏത് തരം ബിസിനസ് ആണ്?",
    askCity: "നിങ്ങളുടെ ബിസിനസ് ഏത് നഗരത്തിലാണ്?",
    askPurpose:
      "നിങ്ങൾ എന്തിനാണ് ഈ പ്ലാറ്റ്ഫോം ഉപയോഗിക്കാൻ ആഗ്രഹിക്കുന്നത്? നിങ്ങളുടെ വാക്കുകളിൽ പറയൂ.",
    askPhone: "ഈ അക്കൗണ്ടിനായി നിങ്ങളുടെ ഫോൺ നമ്പർ നൽകൂ.",
    askName: "അവസാന ഘട്ടം: നിങ്ങളുടെ AI ജീവനക്കാരന് ഒരു പേര് നൽകൂ.",
    done: "നന്ദി! {shopName}-നായി {agentName} തയ്യാറാകുന്നു. നിങ്ങളെ ഡാഷ്‌ബോർഡിലേക്ക് കൊണ്ടുപോകുന്നു...",
    nameLabel: "പേര്",
    categoryLabel: "വിഭാഗം",
    shopNamePlaceholder: "കടയുടെ പേര്",
    categoryPlaceholder: "വിഭാഗം തിരഞ്ഞെടുക്കുക",
    cityPlaceholder: "നഗരം തിരഞ്ഞെടുക്കുക",
    citySearch: "നഗരം തിരയൂ...",
    cityEmpty: "നഗരം കണ്ടെത്തിയില്ല.",
    purposePlaceholder: "എന്തിനാണ് ഉപയോഗിക്കാൻ ആഗ്രഹിക്കുന്നതെന്ന് പറയൂ...",
    phonePlaceholder: "10 അക്ക മൊബൈൽ നമ്പർ",
    namePlaceholder: "ഉദാ. ആശ",
    send: "അയയ്ക്കുക",
    required: "ദയവായി ഇത് പൂരിപ്പിക്കുക.",
    invalidPhone: "ശരിയായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകൂ.",
    saveFailed: "സേവ് ചെയ്യാനായില്ല. വീണ്ടും ശ്രമിക്കൂ.",
    retry: "വീണ്ടും ശ്രമിക്കൂ",
    retake: "വീണ്ടും തുടങ്ങുക",
    categories: {
      grocery: "പലചരക്ക് കട",
      restaurant: "റെസ്റ്റോറന്റ് / കഫേ",
      fashion: "വസ്ത്രം / ഫാഷൻ",
      electronics: "ഇലക്ട്രോണിക്സ് / മൊബൈൽ",
      pharmacy: "മെഡിക്കൽ ഷോപ്പ്",
      salon: "സലൂൺ / ബ്യൂട്ടി",
      education: "കോച്ചിംഗ് / വിദ്യാഭ്യാസം",
      services: "പ്രാദേശിക സേവനങ്ങൾ",
      other: "മറ്റുള്ളവ",
    },
  },
  mr: {
    greet: "नमस्कार!",
    askBusiness:
      "चला तुमचा बिझनेस सेट करूया. तुमच्या दुकानाचे नाव काय आणि तो कोणत्या प्रकारचा बिझनेस आहे?",
    askCity: "तुमचा बिझनेस कोणत्या शहरात आहे?",
    askPurpose: "तुम्हाला हे प्लॅटफॉर्म का वापरायचे आहे? तुमच्या शब्दांत सांगा.",
    askPhone: "या अकाउंटसाठी कृपया तुमचा फोन नंबर द्या.",
    askName: "शेवटची पायरी: तुमच्या AI कर्मचाऱ्याला एक नाव द्या.",
    done: "धन्यवाद! {shopName} साठी {agentName} तयार होत आहे. तुम्हाला डॅशबोर्डवर नेत आहोत...",
    nameLabel: "नाव",
    categoryLabel: "प्रकार",
    shopNamePlaceholder: "दुकानाचे नाव",
    categoryPlaceholder: "प्रकार निवडा",
    cityPlaceholder: "शहर निवडा",
    citySearch: "शहर शोधा...",
    cityEmpty: "शहर सापडले नाही.",
    purposePlaceholder: "तुम्हाला का वापरायचे आहे ते सांगा...",
    phonePlaceholder: "10 अंकी मोबाईल नंबर",
    namePlaceholder: "उदा. आशा",
    send: "पाठवा",
    required: "कृपया हे भरा.",
    invalidPhone: "योग्य 10 अंकी मोबाईल नंबर टाका.",
    saveFailed: "सेव्ह करता आले नाही. पुन्हा प्रयत्न करा.",
    retry: "पुन्हा प्रयत्न करा",
    retake: "पुन्हा सुरू करा",
    categories: {
      grocery: "किराणा दुकान",
      restaurant: "रेस्टॉरंट / कॅफे",
      fashion: "कपडे / फॅशन",
      electronics: "इलेक्ट्रॉनिक्स / मोबाईल",
      pharmacy: "औषधाचे दुकान",
      salon: "सलून / ब्युटी",
      education: "कोचिंग / शिक्षण",
      services: "स्थानिक सेवा",
      other: "इतर",
    },
  },
  bn: {
    greet: "নমস্কার!",
    askBusiness:
      "চলুন আপনার ব্যবসা সেট করি। আপনার দোকানের নাম কী, আর এটি কী ধরনের ব্যবসা?",
    askCity: "আপনার ব্যবসা কোন শহরে?",
    askPurpose: "আপনি এই প্ল্যাটফর্ম কেন ব্যবহার করতে চান? নিজের ভাষায় বলুন।",
    askPhone: "এই অ্যাকাউন্টের জন্য আপনার ফোন নম্বর দিন।",
    askName: "শেষ ধাপ: আপনার AI কর্মীকে একটি নাম দিন।",
    done: "ধন্যবাদ! {shopName}-এর জন্য {agentName} তৈরি হচ্ছে। আপনাকে ড্যাশবোর্ডে নিয়ে যাচ্ছি...",
    nameLabel: "নাম",
    categoryLabel: "ধরন",
    shopNamePlaceholder: "দোকানের নাম",
    categoryPlaceholder: "ধরন বেছে নিন",
    cityPlaceholder: "শহর বেছে নিন",
    citySearch: "শহর খুঁজুন...",
    cityEmpty: "কোনো শহর পাওয়া যায়নি।",
    purposePlaceholder: "কেন ব্যবহার করতে চান বলুন...",
    phonePlaceholder: "10 সংখ্যার মোবাইল নম্বর",
    namePlaceholder: "যেমন: আশা",
    send: "পাঠান",
    required: "অনুগ্রহ করে এটি পূরণ করুন।",
    invalidPhone: "সঠিক 10 সংখ্যার মোবাইল নম্বর দিন।",
    saveFailed: "সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।",
    retry: "আবার চেষ্টা করুন",
    retake: "আবার শুরু করুন",
    categories: {
      grocery: "মুদির দোকান",
      restaurant: "রেস্তোরাঁ / ক্যাফে",
      fashion: "পোশাক / ফ্যাশন",
      electronics: "ইলেকট্রনিক্স / মোবাইল",
      pharmacy: "ওষুধের দোকান",
      salon: "সেলুন / বিউটি",
      education: "কোচিং / শিক্ষা",
      services: "স্থানীয় পরিষেবা",
      other: "অন্যান্য",
    },
  },
  gu: {
    greet: "નમસ્તે!",
    askBusiness:
      "ચાલો તમારો બિઝનેસ સેટ કરીએ. તમારી દુકાનનું નામ શું છે અને તે કેવા પ્રકારનો બિઝનેસ છે?",
    askCity: "તમારો બિઝનેસ કયા શહેરમાં છે?",
    askPurpose: "તમે આ પ્લેટફોર્મનો ઉપયોગ કેમ કરવા માંગો છો? તમારા શબ્દોમાં જણાવો.",
    askPhone: "આ એકાઉન્ટ માટે કૃપા કરીને તમારો ફોન નંબર આપો.",
    askName: "છેલ્લું પગલું: તમારા AI કર્મચારીને એક નામ આપો.",
    done: "આભાર! {shopName} માટે {agentName} તૈયાર થઈ રહ્યું છે. તમને ડેશબોર્ડ પર લઈ જઈએ છીએ...",
    nameLabel: "નામ",
    categoryLabel: "પ્રકાર",
    shopNamePlaceholder: "દુકાનનું નામ",
    categoryPlaceholder: "પ્રકાર પસંદ કરો",
    cityPlaceholder: "શહેર પસંદ કરો",
    citySearch: "શહેર શોધો...",
    cityEmpty: "કોઈ શહેર મળ્યું નહીં.",
    purposePlaceholder: "તમે કેમ ઉપયોગ કરવા માંગો છો તે જણાવો...",
    phonePlaceholder: "10 અંકનો મોબાઇલ નંબર",
    namePlaceholder: "દા.ત. આશા",
    send: "મોકલો",
    required: "કૃપા કરીને આ ભરો.",
    invalidPhone: "સાચો 10 અંકનો મોબાઇલ નંબર આપો.",
    saveFailed: "સેવ થઈ શક્યું નહીં. ફરી પ્રયાસ કરો.",
    retry: "ફરી પ્રયાસ કરો",
    retake: "ફરી શરૂ કરો",
    categories: {
      grocery: "કરિયાણાની દુકાન",
      restaurant: "રેસ્ટોરન્ટ / કાફે",
      fashion: "કપડાં / ફેશન",
      electronics: "ઇલેક્ટ્રોનિક્સ / મોબાઇલ",
      pharmacy: "દવાની દુકાન",
      salon: "સલૂન / બ્યુટી",
      education: "કોચિંગ / શિક્ષણ",
      services: "સ્થાનિક સેવાઓ",
      other: "અન્ય",
    },
  },
  pa: {
    greet: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ!",
    askBusiness:
      "ਆਓ ਤੁਹਾਡਾ ਕਾਰੋਬਾਰ ਸੈੱਟ ਕਰੀਏ। ਤੁਹਾਡੀ ਦੁਕਾਨ ਦਾ ਨਾਂ ਕੀ ਹੈ ਅਤੇ ਇਹ ਕਿਸ ਤਰ੍ਹਾਂ ਦਾ ਕਾਰੋਬਾਰ ਹੈ?",
    askCity: "ਤੁਹਾਡਾ ਕਾਰੋਬਾਰ ਕਿਸ ਸ਼ਹਿਰ ਵਿੱਚ ਹੈ?",
    askPurpose: "ਤੁਸੀਂ ਇਸ ਪਲੇਟਫ਼ਾਰਮ ਦੀ ਵਰਤੋਂ ਕਿਉਂ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ? ਆਪਣੇ ਸ਼ਬਦਾਂ ਵਿੱਚ ਦੱਸੋ।",
    askPhone: "ਇਸ ਖਾਤੇ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਫ਼ੋਨ ਨੰਬਰ ਦੱਸੋ।",
    askName: "ਆਖ਼ਰੀ ਕਦਮ: ਆਪਣੇ AI ਕਰਮਚਾਰੀ ਨੂੰ ਇੱਕ ਨਾਂ ਦਿਓ।",
    done: "ਧੰਨਵਾਦ! {shopName} ਲਈ {agentName} ਤਿਆਰ ਹੋ ਰਿਹਾ ਹੈ। ਤੁਹਾਨੂੰ ਡੈਸ਼ਬੋਰਡ ਤੇ ਲੈ ਜਾ ਰਹੇ ਹਾਂ...",
    nameLabel: "ਨਾਂ",
    categoryLabel: "ਕਿਸਮ",
    shopNamePlaceholder: "ਦੁਕਾਨ ਦਾ ਨਾਂ",
    categoryPlaceholder: "ਕਿਸਮ ਚੁਣੋ",
    cityPlaceholder: "ਸ਼ਹਿਰ ਚੁਣੋ",
    citySearch: "ਸ਼ਹਿਰ ਲੱਭੋ...",
    cityEmpty: "ਕੋਈ ਸ਼ਹਿਰ ਨਹੀਂ ਮਿਲਿਆ।",
    purposePlaceholder: "ਦੱਸੋ ਤੁਸੀਂ ਕਿਉਂ ਵਰਤਣਾ ਚਾਹੁੰਦੇ ਹੋ...",
    phonePlaceholder: "10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ",
    namePlaceholder: "ਜਿਵੇਂ ਆਸ਼ਾ",
    send: "ਭੇਜੋ",
    required: "ਕਿਰਪਾ ਕਰਕੇ ਇਹ ਭਰੋ।",
    invalidPhone: "ਸਹੀ 10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ ਦਿਓ।",
    saveFailed: "ਸੇਵ ਨਹੀਂ ਹੋ ਸਕਿਆ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    retry: "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
    retake: "ਦੁਬਾਰਾ ਸ਼ੁਰੂ ਕਰੋ",
    categories: {
      grocery: "ਕਰਿਆਨੇ ਦੀ ਦੁਕਾਨ",
      restaurant: "ਰੈਸਟੋਰੈਂਟ / ਕੈਫ਼ੇ",
      fashion: "ਕੱਪੜੇ / ਫੈਸ਼ਨ",
      electronics: "ਇਲੈਕਟ੍ਰਾਨਿਕਸ / ਮੋਬਾਈਲ",
      pharmacy: "ਦਵਾਈਆਂ ਦੀ ਦੁਕਾਨ",
      salon: "ਸੈਲੂਨ / ਬਿਊਟੀ",
      education: "ਕੋਚਿੰਗ / ਸਿੱਖਿਆ",
      services: "ਸਥਾਨਕ ਸੇਵਾਵਾਂ",
      other: "ਹੋਰ",
    },
  },
};

// Replaces {name} placeholders in a message with values.
export function fill(text: string, values: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

export type Lang = 'en' | 'mr'

export type TranslationKey =
  // ---- Home page ----
  | 'home.title1'
  | 'home.title2'
  | 'home.subtitle'
  | 'home.browseEquipment'
  | 'home.listYourEquipment'
  | 'home.login'
  | 'home.signUpFarmer'
  | 'home.signUpOwner'
  | 'home.featureModernTitle'
  | 'home.featureModernDesc'
  | 'home.featureLocationTitle'
  | 'home.featureLocationDesc'
  | 'home.featurePayTitle'
  | 'home.featurePayDesc'
  | 'home.howItWorksTitle'
  | 'home.step1Title'
  | 'home.step1Desc'
  | 'home.step2Title'
  | 'home.step2Desc'
  | 'home.step3Title'
  | 'home.step3Desc'
  | 'home.step4Title'
  | 'home.step4Desc'
  | 'home.ctaTitle'
  | 'home.ctaDesc'
  // ---- Equipment Browse page ----
  | 'equip.pageTitle'
  | 'equip.pageSubtitle'
  | 'equip.searchPlaceholder'
  | 'equip.locationPlaceholder'
  | 'equip.allCategories'
  | 'equip.clearFilters'
  | 'equip.loading'
  | 'equip.noResultsTitle'
  | 'equip.noResultsDesc'
  | 'equip.perDay'
  | 'equip.bookNow'
  | 'equip.noReviews'
  | 'equip.myAccount'
  | 'equip.myBookings'
  | 'equip.dashboard'
  | 'equip.logout'
  | 'equip.loginToBook'
  // ---- Bookings page ----
  | 'book.pageTitle'
  | 'book.loading'
  | 'book.noBookingsTitle'
  | 'book.noBookingsDesc'
  | 'book.browseEquipment'
  | 'book.dateBooked'
  | 'book.rental'
  | 'book.to'
  | 'book.location'
  | 'book.ownerContact'
  | 'book.totalCost'
  | 'book.payOnArrival'
  | 'book.leaveReview'
  | 'book.alreadyReviewed'
  | 'book.writeReview'
  | 'book.reviewPlaceholder'
  | 'book.submitReview'
  | 'book.cancel'
  | 'book.backToEquipment'
  // ---- Status badges ----
  | 'status.pending'
  | 'status.confirmed'
  | 'status.active'
  | 'status.completed'
  | 'status.cancelled'
  // ---- Lang switcher ----
  | 'lang.english'
  | 'lang.marathi'

type Translations = Record<TranslationKey, string>

const en: Translations = {
  // Home
  'home.title1': 'Agricultural Equipment',
  'home.title2': 'Rental Platform',
  'home.subtitle': 'Access modern farming equipment without the burden of ownership. Pay on delivery, rent by the day, and grow your farm efficiently.',
  'home.browseEquipment': 'Browse Equipment',
  'home.listYourEquipment': 'List Your Equipment',
  'home.login': 'Login',
  'home.signUpFarmer': 'Sign Up as Farmer',
  'home.signUpOwner': 'Sign Up as Owner',
  'home.featureModernTitle': 'Modern Equipment',
  'home.featureModernDesc': 'Access a wide range of tractors, harvesters, and specialized farming equipment from verified owners',
  'home.featureLocationTitle': 'Search by Location',
  'home.featureLocationDesc': "Find equipment near your farm. Filter by city or area to see what's available close to you",
  'home.featurePayTitle': 'Pay on Arrival',
  'home.featurePayDesc': 'No digital payment needed. Pay the owner in cash when the equipment is delivered to your farm',
  'home.howItWorksTitle': 'How It Works',
  'home.step1Title': 'Browse Equipment',
  'home.step1Desc': 'Find the right equipment near you by name or location',
  'home.step2Title': 'Select Dates',
  'home.step2Desc': 'Choose your rental period and review costs',
  'home.step3Title': 'Confirm Booking',
  'home.step3Desc': 'Complete your booking with one click',
  'home.step4Title': 'Pay on Delivery',
  'home.step4Desc': 'Pay the owner in cash when equipment arrives',
  'home.ctaTitle': 'Ready to Get Started?',
  'home.ctaDesc': 'Browse available equipment near you and book with cash on delivery — no digital payments needed.',
  // Equipment
  'equip.pageTitle': 'Browse Equipment',
  'equip.pageSubtitle': 'Find and rent agricultural equipment near you',
  'equip.searchPlaceholder': 'Search equipment...',
  'equip.locationPlaceholder': 'Filter by location...',
  'equip.allCategories': 'All Categories',
  'equip.clearFilters': 'Clear all filters',
  'equip.loading': 'Loading equipment...',
  'equip.noResultsTitle': 'No equipment found',
  'equip.noResultsDesc': 'Try adjusting your search or filters',
  'equip.perDay': '/ day',
  'equip.bookNow': 'Book Now',
  'equip.noReviews': 'No reviews',
  'equip.myAccount': 'My Account',
  'equip.myBookings': 'My Bookings',
  'equip.dashboard': 'Dashboard',
  'equip.logout': 'Logout',
  'equip.loginToBook': 'Login to Book',
  // Bookings
  'book.pageTitle': 'My Bookings',
  'book.loading': 'Loading your bookings...',
  'book.noBookingsTitle': 'No bookings yet',
  'book.noBookingsDesc': "You haven't made any equipment bookings yet.",
  'book.browseEquipment': 'Browse Equipment',
  'book.dateBooked': 'Booked on',
  'book.rental': 'Rental:',
  'book.to': 'to',
  'book.location': 'Location:',
  'book.ownerContact': 'Owner Contact:',
  'book.totalCost': 'Total Cost:',
  'book.payOnArrival': 'Pay on arrival',
  'book.leaveReview': 'Leave Review',
  'book.alreadyReviewed': 'Reviewed ✓',
  'book.writeReview': 'Write a Review',
  'book.reviewPlaceholder': 'Share your experience with this equipment...',
  'book.submitReview': 'Submit Review',
  'book.cancel': 'Cancel',
  'book.backToEquipment': 'Back to Equipment',
  // Status
  'status.pending': 'Pending',
  'status.confirmed': 'Confirmed',
  'status.active': 'Active',
  'status.completed': 'Completed',
  'status.cancelled': 'Cancelled',
  // Lang
  'lang.english': 'English',
  'lang.marathi': 'मराठी',
}

const mr: Translations = {
  // Home
  'home.title1': 'शेती उपकरण',
  'home.title2': 'भाडे प्लॅटफॉर्म',
  'home.subtitle': 'आधुनिक शेती उपकरणे मालकीशिवाय वापरा. वितरणावर पैसे द्या, दिवसानुसार भाडे घ्या आणि आपले शेत कार्यक्षमतेने वाढवा.',
  'home.browseEquipment': 'उपकरणे पहा',
  'home.listYourEquipment': 'आपले उपकरण नोंदवा',
  'home.login': 'लॉगिन',
  'home.signUpFarmer': 'शेतकरी म्हणून नोंदणी करा',
  'home.signUpOwner': 'मालक म्हणून नोंदणी करा',
  'home.featureModernTitle': 'आधुनिक उपकरणे',
  'home.featureModernDesc': 'सत्यापित मालकांकडून ट्रॅक्टर, हार्वेस्टर आणि विशेष शेती उपकरणांची विस्तृत श्रेणी मिळवा',
  'home.featureLocationTitle': 'स्थानानुसार शोधा',
  'home.featureLocationDesc': 'आपल्या शेताजवळ उपकरणे शोधा. शहर किंवा क्षेत्रानुसार फिल्टर करा',
  'home.featurePayTitle': 'आगमनावर पैसे द्या',
  'home.featurePayDesc': 'डिजिटल पेमेंट आवश्यक नाही. उपकरण शेतावर पोहोचले की रोख पैसे द्या',
  'home.howItWorksTitle': 'हे कसे कार्य करते',
  'home.step1Title': 'उपकरणे पहा',
  'home.step1Desc': 'नाव किंवा स्थानानुसार जवळचे उपकरण शोधा',
  'home.step2Title': 'तारखा निवडा',
  'home.step2Desc': 'भाडे कालावधी निवडा आणि खर्च तपासा',
  'home.step3Title': 'बुकिंग निश्चित करा',
  'home.step3Desc': 'एका क्लिकने बुकिंग पूर्ण करा',
  'home.step4Title': 'वितरणावर पैसे द्या',
  'home.step4Desc': 'उपकरण आल्यावर मालकाला रोख पैसे द्या',
  'home.ctaTitle': 'सुरू करण्यास तयार आहात?',
  'home.ctaDesc': 'जवळचे उपकरण पहा आणि रोख वितरणासह बुक करा — डिजिटल पेमेंट आवश्यक नाही.',
  // Equipment
  'equip.pageTitle': 'उपकरणे पहा',
  'equip.pageSubtitle': 'जवळची शेती उपकरणे शोधा आणि भाड्याने घ्या',
  'equip.searchPlaceholder': 'उपकरण शोधा...',
  'equip.locationPlaceholder': 'स्थानानुसार फिल्टर करा...',
  'equip.allCategories': 'सर्व श्रेणी',
  'equip.clearFilters': 'सर्व फिल्टर साफ करा',
  'equip.loading': 'उपकरणे लोड होत आहेत...',
  'equip.noResultsTitle': 'कोणतेही उपकरण सापडले नाही',
  'equip.noResultsDesc': 'आपला शोध किंवा फिल्टर समायोजित करण्याचा प्रयत्न करा',
  'equip.perDay': '/ दिवस',
  'equip.bookNow': 'आता बुक करा',
  'equip.noReviews': 'कोणत्या समीक्षा नाहीत',
  'equip.myAccount': 'माझे खाते',
  'equip.myBookings': 'माझ्या बुकिंग',
  'equip.dashboard': 'डॅशबोर्ड',
  'equip.logout': 'लॉगआउट',
  'equip.loginToBook': 'बुक करण्यासाठी लॉगिन करा',
  // Bookings
  'book.pageTitle': 'माझ्या बुकिंग',
  'book.loading': 'आपल्या बुकिंग लोड होत आहेत...',
  'book.noBookingsTitle': 'अजून कोणतीही बुकिंग नाही',
  'book.noBookingsDesc': 'आपण अद्याप कोणत्याही उपकरणाची बुकिंग केलेली नाही.',
  'book.browseEquipment': 'उपकरणे पहा',
  'book.dateBooked': 'बुकिंग केले',
  'book.rental': 'भाडे:',
  'book.to': 'ते',
  'book.location': 'स्थान:',
  'book.ownerContact': 'मालक संपर्क:',
  'book.totalCost': 'एकूण खर्च:',
  'book.payOnArrival': 'आगमनावर पैसे द्या',
  'book.leaveReview': 'समीक्षा द्या',
  'book.alreadyReviewed': 'समीक्षा केली ✓',
  'book.writeReview': 'समीक्षा लिहा',
  'book.reviewPlaceholder': 'या उपकरणाचा अनुभव शेअर करा...',
  'book.submitReview': 'समीक्षा सबमिट करा',
  'book.cancel': 'रद्द करा',
  'book.backToEquipment': 'उपकरणांकडे परत जा',
  // Status
  'status.pending': 'प्रलंबित',
  'status.confirmed': 'पुष्टी झाली',
  'status.active': 'सक्रिय',
  'status.completed': 'पूर्ण झाली',
  'status.cancelled': 'रद्द केली',
  // Lang
  'lang.english': 'English',
  'lang.marathi': 'मराठी',
}

export const translations: Record<Lang, Translations> = { en, mr }

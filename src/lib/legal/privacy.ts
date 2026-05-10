import type { LegalDocument } from "@/components/legal/legal-page";

// Initial draft for an Egypt-based online coaching service. Replace
// placeholders (BUSINESS_NAME, CONTACT_EMAIL, BUSINESS_ADDRESS) with the
// real legal entity details before publishing, and have a qualified
// Egyptian privacy lawyer review the text against PDPL Law 151/2020.
export const privacyDoc: LegalDocument = {
  title_en: "Privacy Policy",
  title_ar: "سياسة الخصوصية",
  effective_date_en: "Last updated: 2025-01-01 — initial draft",
  effective_date_ar: "آخر تحديث: 2025-01-01 — مسودة أولية",
  intro_en:
    'This Privacy Policy explains how the online coaching service operated by [BUSINESS_NAME] ("we", "us") collects, uses, and protects your personal data when you use this website, the application form, or coaching services.',
  intro_ar:
    "هذه السياسة بتشرح إزاي خدمة التدريب الأونلاين اللي بتديرها [BUSINESS_NAME] بتجمع بياناتك الشخصية وبتستخدمها وبتحميها لما تستخدم الموقع أو فورم التقديم أو خدمات التدريب.",
  sections: [
    {
      heading_en: "Who we are",
      heading_ar: "مين إحنا",
      body_en: [
        "[BUSINESS_NAME] is an Egypt-based fitness and nutrition coaching service. The data controller responsible for your personal data is [BUSINESS_NAME], based at [BUSINESS_ADDRESS].",
        "For any privacy-related questions or requests, contact us at [CONTACT_EMAIL].",
      ],
      body_ar: [
        "[BUSINESS_NAME] خدمة تدريب لياقة وتغذية مقرها مصر. الجهة المسؤولة عن بياناتك الشخصية هي [BUSINESS_NAME] والعنوان [BUSINESS_ADDRESS].",
        "لأي استفسار أو طلب يخص الخصوصية، تواصل معنا على [CONTACT_EMAIL].",
      ],
    },
    {
      heading_en: "Data we collect",
      heading_ar: "البيانات اللي بنجمعها",
      body_en: [
        "Account data: name, email, phone, country, and password hash when you register.",
        "Application form data: age, gender, height, weight, body fat estimate, training history, medical history, dietary preferences, sleep, stress, and any other information you choose to provide so we can build your program.",
        "Training and progress data: workout logs, body measurements, progress photos (if you upload them), and weekly check-in answers.",
        "Communication data: messages exchanged with your coach, application notes, and call/contact preferences.",
        "Payment data: handled by external payment processors. We store only the transaction reference and amount, never full card numbers.",
        "Technical data: IP address, browser, device information, and approximate location, used for security, fraud prevention, and basic analytics.",
      ],
      body_ar: [
        "بيانات الحساب: الاسم، الإيميل، التليفون، الدولة، وكلمة السر (مشفّرة) لما تسجّل.",
        "بيانات فورم التقديم: السن، النوع، الطول، الوزن، تقدير نسبة الدهون، خبرة التدريب، التاريخ المرضي، التفضيلات الغذائية، النوم، التوتر، وأي معلومات تختار تشاركها علشان نبني لك برنامج مخصص.",
        "بيانات التدريب والتقدم: سجلات التمرين، القياسات، صور التقدم (لو رفعتها)، والمتابعة الأسبوعية.",
        "بيانات التواصل: الرسايل بينك وبين الكوتش، ملاحظات الطلب، وتفضيلات التواصل/المكالمات.",
        "بيانات الدفع: بتتعامل عن طريق بوابات دفع خارجية. إحنا بنحفظ بس مرجع العملية والمبلغ من غير ما نشوف رقم الكارت كامل.",
        "بيانات تقنية: الـIP والمتصفح ومعلومات الجهاز والموقع التقريبي، علشان الأمان ومنع الاحتيال والتحليلات الأساسية.",
      ],
    },
    {
      heading_en: "How we use your data",
      heading_ar: "إزاي بنستخدم بياناتك",
      body_en: [
        "To deliver coaching: build your training and nutrition plan, monitor progress, and adapt your program over time.",
        "To communicate: respond to your application, schedule calls, send check-in reminders, and answer your questions.",
        "To process payments and manage subscriptions.",
        "To comply with Egyptian law (tax records, anti-money-laundering, court orders).",
        "To improve our service: aggregate, anonymized usage statistics; we never sell your data.",
      ],
      body_ar: [
        "لتقديم التدريب: نبني خطة التمرين والتغذية، نتابع تقدمك، ونحدّث البرنامج على مدار الوقت.",
        "للتواصل: نرد على طلبك، نحدد المكالمات، نبعت تذكيرات المتابعة، ونجاوب على أسئلتك.",
        "لمعالجة المدفوعات وإدارة الاشتراكات.",
        "للامتثال للقانون المصري (السجلات الضريبية، مكافحة غسيل الأموال، أوامر المحاكم).",
        "لتحسين الخدمة: إحصائيات استخدام مجمّعة ومجهّلة الهوية. إحنا أبداً ما بنبيع بياناتك.",
      ],
    },
    {
      heading_en: "Legal basis",
      heading_ar: "الأساس القانوني",
      body_en: [
        "We rely on the following legal bases under Egyptian PDPL Law 151/2020 and equivalent international standards:",
        "Performance of a contract — to deliver the coaching service you signed up for.",
        "Consent — for any sensitive health-related data you voluntarily share, and for marketing communications you opt in to.",
        "Legal obligation — to keep tax and accounting records.",
        "Legitimate interest — to secure the service and prevent abuse.",
      ],
      body_ar: [
        "بنعتمد على الأسس القانونية دي تحت قانون حماية البيانات المصري رقم 151/2020 والمعايير الدولية المماثلة:",
        "تنفيذ العقد — علشان نقدم لك الخدمة اللي اشتركت فيها.",
        "الموافقة — لأي بيانات صحية حساسة بتشاركها معانا اختياريًا، ولأي مراسلات تسويقية بتختار تشترك فيها.",
        "الالتزام القانوني — لحفظ السجلات الضريبية والمحاسبية.",
        "المصلحة المشروعة — لتأمين الخدمة ومنع إساءة الاستخدام.",
      ],
    },
    {
      heading_en: "Sharing with third parties",
      heading_ar: "المشاركة مع الأطراف الخارجية",
      body_en: [
        "We share data only with processors necessary to run the service:",
        "Hosting & database: Supabase (EU/US regions, with row-level access control).",
        "Email delivery: Resend or equivalent transactional email provider, only for service-related emails (application receipts, login codes, reminders).",
        "Payment processing: third-party payment processors (e.g. Paymob, Stripe), governed by their own privacy policies.",
        "Error monitoring: Sentry, used to log technical errors. Personal data is scrubbed from these logs where feasible.",
        "We never sell or rent personal data, and we do not share it with advertisers.",
      ],
      body_ar: [
        "بنشارك البيانات بس مع مزودي الخدمة الضروريين لتشغيل الخدمة:",
        "الاستضافة وقاعدة البيانات: Supabase (مراكز بيانات في أوروبا/أمريكا، مع تحكم وصول على مستوى الصف).",
        "إرسال الإيميلات: Resend أو مزود مماثل، بس للإيميلات الخدمية (إيصال التقديم، أكواد الدخول، التذكيرات).",
        "معالجة المدفوعات: بوابات دفع خارجية (زي Paymob و Stripe)، حسب سياسات الخصوصية الخاصة بيهم.",
        "مراقبة الأخطاء: Sentry لتسجيل الأخطاء التقنية. بنحاول نشيل البيانات الشخصية من السجلات دي قدر الإمكان.",
        "إحنا أبداً ما بنبيع أو نأجّر بياناتك الشخصية، ومش بنشاركها مع المعلنين.",
      ],
    },
    {
      heading_en: "International data transfers",
      heading_ar: "نقل البيانات الدولي",
      body_en: [
        "Some processors (Supabase, Resend, Sentry) may store data outside Egypt (EU/US). When this happens, we rely on standard contractual clauses or equivalent safeguards required by Egyptian PDPL.",
      ],
      body_ar: [
        "بعض المزودين (Supabase, Resend, Sentry) ممكن يخزّنوا البيانات خارج مصر (أوروبا/أمريكا). في الحالة دي، بنعتمد على البنود التعاقدية القياسية أو ضمانات مكافئة مطلوبة من قانون حماية البيانات المصري.",
      ],
    },
    {
      heading_en: "Data retention",
      heading_ar: "مدة الاحتفاظ بالبيانات",
      body_en: [
        "Active client data is kept for as long as your subscription is active.",
        "Application form submissions that did not convert to a client are kept for up to 12 months for follow-up, then deleted.",
        "Financial records (invoices, payment receipts) are retained for the period required by Egyptian tax law (currently 7 years).",
        "You can request earlier deletion of any data not subject to a legal retention obligation.",
      ],
      body_ar: [
        "بيانات العميل النشط بتفضل محفوظة طول ما الاشتراك شغّال.",
        "طلبات التقديم اللي ما تحولتش لعميل بتفضل محفوظة لمدة 12 شهر للمتابعة، وبعد كده بتتمسح.",
        "السجلات المالية (الفواتير وإيصالات الدفع) بتفضل محفوظة للمدة اللي بيحددها القانون الضريبي المصري (حاليًا 7 سنين).",
        "تقدر تطلب حذف أي بيانات مش خاضعة لالتزام قانوني للحفظ في وقت أبكر.",
      ],
    },
    {
      heading_en: "Your rights",
      heading_ar: "حقوقك",
      body_en: [
        "Under Egyptian PDPL Law 151/2020 you have the right to:",
        "Access — request a copy of the data we hold about you.",
        "Rectification — correct inaccurate or incomplete data.",
        "Erasure — request deletion when there is no legal basis to keep it.",
        "Restriction — limit how we process your data while a complaint is pending.",
        "Withdraw consent — at any time, where processing relies on consent.",
        "Complain — to the Egyptian Personal Data Protection Center (PDPC) if you believe your rights have been violated.",
        "Email [CONTACT_EMAIL] to exercise any of these rights. We respond within 30 days.",
      ],
      body_ar: [
        "تحت قانون حماية البيانات المصري رقم 151/2020، عندك الحق في:",
        "الوصول — تطلب نسخة من البيانات اللي عندنا عنك.",
        "التصحيح — تصلح أي بيانات غلط أو ناقصة.",
        "الحذف — تطلب حذف بياناتك لما يبقى مفيش أساس قانوني للاحتفاظ بيها.",
        "التقييد — تحدد إزاي بنعالج بياناتك أثناء النظر في شكوى.",
        "سحب الموافقة — في أي وقت، لما تكون المعالجة معتمدة على موافقتك.",
        "تقديم شكوى — لمركز حماية البيانات الشخصية المصري (PDPC) لو حسّيت إن حقوقك اتنتهكت.",
        "ابعت إيميل لـ[CONTACT_EMAIL] لممارسة أي من الحقوق دي. بنرد خلال 30 يوم.",
      ],
    },
    {
      heading_en: "Security",
      heading_ar: "الأمان",
      body_en: [
        "We use TLS encryption in transit, encrypted databases at rest, row-level access control to ensure each user only sees their own data, and strict admin role separation.",
        "No system is 100% secure. If a data breach materially affects your data, we will notify you and the PDPC within 72 hours of becoming aware of it, as required by law.",
      ],
      body_ar: [
        "بنستخدم تشفير TLS أثناء النقل، قواعد بيانات مشفّرة في التخزين، تحكم وصول على مستوى الصف علشان كل مستخدم يشوف بياناته بس، وفصل صارم لصلاحيات الأدمن.",
        "مفيش نظام آمن 100%. لو حصل اختراق وأثّر بشكل جوهري على بياناتك، هنبلغك وهنبلغ مركز حماية البيانات خلال 72 ساعة من علمنا بالحادثة، حسب القانون.",
      ],
    },
    {
      heading_en: "Cookies",
      heading_ar: "ملفات الكوكيز",
      body_en: [
        "We use only essential cookies required to keep you logged in and remember your language preference.",
        "If we add analytics or marketing cookies in the future, we will request your consent first via a cookie banner.",
      ],
      body_ar: [
        "بنستخدم بس الكوكيز الأساسية اللي بتخلّيك مسجّل دخول وبتفتكر تفضيل لغتك.",
        "لو ضفنا كوكيز تحليلية أو تسويقية في المستقبل، هنطلب موافقتك الأول عن طريق إشعار كوكيز.",
      ],
    },
    {
      heading_en: "Children",
      heading_ar: "القاصرون",
      body_en: [
        "This service is intended for adults (18+). We do not knowingly collect data from minors under 18. If you believe a minor has submitted data, contact [CONTACT_EMAIL] and we will delete it promptly.",
      ],
      body_ar: [
        "الخدمة دي للبالغين (18+). إحنا ما بنجمعش عن قصد بيانات من القاصرين تحت 18 سنة. لو حسّيت إن قاصر قدّم بيانات، اتواصل مع [CONTACT_EMAIL] وهنحذفها فورًا.",
      ],
    },
    {
      heading_en: "Changes to this policy",
      heading_ar: "تعديلات على السياسة",
      body_en: [
        "We may update this policy from time to time. Material changes will be communicated via email and a notice on the website at least 14 days before they take effect.",
      ],
      body_ar: [
        "ممكن نحدّث السياسة دي من وقت للتاني. أي تغييرات جوهرية هنبلغ بيها عبر الإيميل وإشعار على الموقع قبل سريانها بـ14 يوم على الأقل.",
      ],
    },
    {
      heading_en: "Contact",
      heading_ar: "تواصل معنا",
      body_en: [
        "Privacy questions or rights requests: [CONTACT_EMAIL].",
        "Postal address: [BUSINESS_ADDRESS], Egypt.",
      ],
      body_ar: [
        "أسئلة الخصوصية أو طلبات الحقوق: [CONTACT_EMAIL].",
        "العنوان البريدي: [BUSINESS_ADDRESS]، مصر.",
      ],
    },
  ],
};

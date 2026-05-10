import type { LegalDocument } from "@/components/legal/legal-page";

// Initial draft of Terms of Service for an Egypt-based online coaching
// service. Replace placeholders before publishing and have a qualified
// lawyer review against the Egyptian Civil Code, Consumer Protection Law,
// and PDPL.
export const termsDoc: LegalDocument = {
  title_en: "Terms of Service",
  title_ar: "شروط الخدمة",
  effective_date_en: "Last updated: 2025-01-01 — initial draft",
  effective_date_ar: "آخر تحديث: 2025-01-01 — مسودة أولية",
  intro_en:
    'These Terms govern your use of the website and online coaching services provided by [BUSINESS_NAME] ("we", "us"). By submitting an application or purchasing a package, you agree to these Terms.',
  intro_ar:
    'الشروط دي بتنظّم استخدامك للموقع وخدمات التدريب الأونلاين المقدّمة من [BUSINESS_NAME] ("إحنا"). بمجرد تقديم طلب أو شراء باقة، إنت موافق على الشروط دي.',
  sections: [
    {
      heading_en: "Eligibility",
      heading_ar: "الأهلية",
      body_en: [
        "You must be at least 18 years old to purchase a package. If you are under 18, you may use the service only with the consent and supervision of a parent or legal guardian who agrees to these Terms on your behalf.",
        "You must provide accurate and truthful information in the application form. Misrepresenting your medical history, fitness level, or identity may result in termination without refund.",
      ],
      body_ar: [
        "لازم يكون عندك 18 سنة على الأقل علشان تشتري باقة. لو أقل من 18، تقدر تستخدم الخدمة بس بموافقة وإشراف ولي الأمر اللي بيوافق على الشروط بدلًا منك.",
        "لازم تقدّم معلومات صحيحة وصادقة في فورم التقديم. تحريف التاريخ المرضي أو مستوى اللياقة أو الهوية ممكن يؤدي إلى إنهاء الخدمة من غير استرداد.",
      ],
    },
    {
      heading_en: "Description of service",
      heading_ar: "وصف الخدمة",
      body_en: [
        "We provide personalized online fitness and nutrition coaching, including training programs, dietary guidance, weekly check-ins, and chat support.",
        "Coaching is delivered remotely via this platform, email, and messaging tools. You are responsible for executing the program in a safe environment.",
      ],
      body_ar: [
        "بنقدم تدريب لياقة وتغذية أونلاين شخصي يتضمن: برامج تدريب، إرشاد غذائي، متابعات أسبوعية، ودعم عبر الشات.",
        "التدريب بيتم عن بُعد من خلال المنصة دي والإيميل وأدوات المراسلة. إنت مسؤول عن تنفيذ البرنامج في بيئة آمنة.",
      ],
    },
    {
      heading_en: "Not medical advice",
      heading_ar: "لا تُعدّ استشارة طبية",
      body_en: [
        "The coaching, training programs, and dietary recommendations provided are NOT medical advice. They are not a substitute for consultation with a qualified physician, registered dietitian, or other healthcare professional.",
        "You agree to consult your physician before starting any new training or nutrition program, especially if you have a medical condition, are pregnant, are taking medication, or are recovering from injury or surgery. You assume all risk associated with physical training. We disclaim liability for injuries, health complications, or adverse outcomes resulting from your participation.",
      ],
      body_ar: [
        "التدريب وبرامج اللياقة والتوصيات الغذائية المقدمة مش استشارة طبية. ومش بديل لاستشارة طبيب مؤهل أو خبير تغذية معتمد أو أي متخصص رعاية صحية تاني.",
        "إنت موافق إنك تستشير طبيبك قبل البدء في أي برنامج تدريب أو تغذية جديد، خصوصًا لو عندك حالة طبية، أو حامل، أو بتاخد دواء، أو بتتعافى من إصابة أو عملية. إنت بتتحمل كل مخاطر التدريب البدني. وإحنا نخلي مسؤوليتنا عن أي إصابات أو مضاعفات صحية أو نتائج عكسية ناتجة من مشاركتك.",
      ],
    },
    {
      heading_en: "Results disclaimer",
      heading_ar: "إخلاء مسؤولية النتائج",
      body_en: [
        "Individual results vary based on adherence, genetics, lifestyle, and many other factors. We do not guarantee any specific outcome (weight loss, muscle gain, body composition, athletic performance, etc.).",
        "Testimonials and progress photos showcased on the website reflect individual results and are not typical or guaranteed.",
      ],
      body_ar: [
        "النتائج بتختلف من شخص لشخص حسب الالتزام والجينات ونمط الحياة وعوامل تانية كتيرة. مش بنضمن أي نتيجة محددة (نزول وزن، زيادة عضلات، تركيب الجسم، الأداء الرياضي، إلخ).",
        "الشهادات وصور التقدم المعروضة على الموقع بتعكس نتائج فردية ومش نموذجية أو مضمونة.",
      ],
    },
    {
      heading_en: "Account and security",
      heading_ar: "الحساب والأمان",
      body_en: [
        "You are responsible for keeping your account password secure. Notify us immediately at [CONTACT_EMAIL] if you suspect unauthorized access.",
        "You may not share your account or login credentials with others. One account per person.",
      ],
      body_ar: [
        "إنت مسؤول عن الحفاظ على كلمة سر حسابك. بلّغنا فورًا على [CONTACT_EMAIL] لو شكّيت في وصول غير مصرح به.",
        "ممنوع تشارك حسابك أو بيانات الدخول مع حد تاني. حساب واحد لكل شخص.",
      ],
    },
    {
      heading_en: "Payments and subscriptions",
      heading_ar: "المدفوعات والاشتراكات",
      body_en: [
        "Prices are listed on the packages page in the displayed currency. Applicable taxes (VAT) are included unless otherwise stated.",
        "Subscriptions renew automatically at the end of each billing period unless cancelled at least 7 days before the renewal date. You can cancel by emailing [CONTACT_EMAIL] or via the account settings page when available.",
        "Failed payments may result in suspension of access until the issue is resolved.",
      ],
      body_ar: [
        "الأسعار مذكورة في صفحة الباقات بالعملة الموضحة. الضرائب (VAT) متضمنة ما لم يُذكر غير كده.",
        "الاشتراكات بتتجدد تلقائيًا في نهاية كل فترة فوترة ما لم يتم إلغاؤها قبل تاريخ التجديد بـ7 أيام على الأقل. تقدر تلغي بإرسال إيميل لـ[CONTACT_EMAIL] أو من إعدادات الحساب لما تتاح.",
        "فشل الدفع ممكن يؤدي لتعليق الوصول لحد ما المشكلة تتحل.",
      ],
    },
    {
      heading_en: "Refunds",
      heading_ar: "الاسترداد",
      body_en: [
        "Refunds are governed by our separate Refund Policy, which is incorporated into these Terms by reference.",
      ],
      body_ar: [
        "الاسترداد بيخضع لسياسة الاسترداد المنفصلة بتاعتنا، اللي بتعتبر جزء من الشروط دي بالإحالة.",
      ],
    },
    {
      heading_en: "User content",
      heading_ar: "محتوى المستخدم",
      body_en: [
        "Photos, measurements, training logs, and messages you upload remain your property. By uploading, you grant us a limited license to use them solely to deliver the coaching service.",
        "We will not use your progress photos for marketing without your explicit written consent.",
      ],
      body_ar: [
        "الصور والقياسات وسجلات التدريب والرسايل اللي بترفعها بتفضل ملكك. بمجرد الرفع، إنت بتمنحنا ترخيص محدود لاستخدامها فقط لتقديم خدمة التدريب.",
        "إحنا ما هنستخدمش صور تقدمك في التسويق من غير موافقتك الكتابية الصريحة.",
      ],
    },
    {
      heading_en: "Intellectual property",
      heading_ar: "الملكية الفكرية",
      body_en: [
        "All training programs, nutrition plans, written content, videos, and branded materials provided to you remain the intellectual property of [BUSINESS_NAME].",
        "You may use these materials for personal, non-commercial purposes only. You may not redistribute, resell, copy, or republish them in any form without prior written permission.",
      ],
      body_ar: [
        "كل برامج التدريب وخطط التغذية والمحتوى المكتوب والفيديوهات والمواد التابعة للعلامة التجارية المقدمة ليك تفضل ملكية فكرية لـ[BUSINESS_NAME].",
        "تقدر تستخدم المواد دي للأغراض الشخصية وغير التجارية فقط. وممنوع تعيد توزيعها أو بيعها أو نسخها أو نشرها بأي شكل من غير إذن كتابي مسبق.",
      ],
    },
    {
      heading_en: "Acceptable use",
      heading_ar: "الاستخدام المقبول",
      body_en: [
        "You agree not to: (a) reverse engineer or attempt to access non-public parts of the platform; (b) use the service for unlawful or harmful purposes; (c) harass, threaten, or abuse coaches or staff; (d) submit false or misleading information.",
        "We may suspend or terminate accounts that violate these rules.",
      ],
      body_ar: [
        "إنت موافق إنك ما تعملش: (أ) هندسة عكسية أو محاولة وصول لأجزاء غير عامة من المنصة؛ (ب) استخدام الخدمة لأغراض غير قانونية أو ضارة؛ (ج) مضايقة أو تهديد أو إساءة معاملة الكوتشيز أو الموظفين؛ (د) تقديم معلومات كاذبة أو مضللة.",
        "ممكن نعلّق أو ننهي الحسابات اللي بتخالف القواعد دي.",
      ],
    },
    {
      heading_en: "Termination",
      heading_ar: "إنهاء الخدمة",
      body_en: [
        "You may terminate your subscription at any time as described above. Termination does not entitle you to a refund except as provided in the Refund Policy.",
        "We may terminate or suspend your access immediately if you breach these Terms or if continued service would expose you or us to legal risk.",
      ],
      body_ar: [
        "تقدر تنهي اشتراكك في أي وقت زي ما موضح فوق. الإنهاء ما بيمنحكش حق استرداد إلا حسب سياسة الاسترداد.",
        "إحنا ممكن ننهي أو نعلّق وصولك فورًا لو خالفت الشروط دي أو لو استمرار الخدمة هيعرّضك أو يعرّضنا لمخاطر قانونية.",
      ],
    },
    {
      heading_en: "Limitation of liability",
      heading_ar: "تحديد المسؤولية",
      body_en: [
        "To the fullest extent permitted by Egyptian law, our total liability arising from or related to the service is limited to the amount you paid us in the 12 months preceding the event giving rise to the claim.",
        "We are not liable for indirect, incidental, consequential, or punitive damages, including lost profits, lost data, or personal injury that does not result from our gross negligence or wilful misconduct.",
      ],
      body_ar: [
        "إلى أقصى حد يسمح به القانون المصري، إجمالي مسؤوليتنا الناشئة عن الخدمة أو المتعلقة بيها بتقتصر على المبلغ اللي دفعته لنا في الـ12 شهر السابقة للحادثة اللي أدت للمطالبة.",
        "إحنا مش مسؤولين عن الأضرار غير المباشرة أو العرضية أو التبعية أو العقابية، بما في ذلك خسارة الأرباح أو البيانات أو الإصابة الشخصية اللي مش ناتجة عن إهمالنا الجسيم أو سوء السلوك المتعمّد.",
      ],
    },
    {
      heading_en: "Governing law and jurisdiction",
      heading_ar: "القانون الحاكم والاختصاص القضائي",
      body_en: [
        "These Terms are governed by the laws of the Arab Republic of Egypt. Any dispute that cannot be resolved amicably will be submitted to the competent Egyptian courts in Cairo.",
      ],
      body_ar: [
        "الشروط دي بتخضع لقوانين جمهورية مصر العربية. أي نزاع ما يمكنش حله وديًا هيتم تقديمه للمحاكم المصرية المختصة في القاهرة.",
      ],
    },
    {
      heading_en: "Changes to these Terms",
      heading_ar: "تعديلات على الشروط",
      body_en: [
        "We may update these Terms from time to time. Material changes will be communicated by email and a notice on the website at least 14 days before they take effect. Continued use of the service after the effective date constitutes acceptance.",
      ],
      body_ar: [
        "ممكن نحدّث الشروط دي من وقت للتاني. أي تغييرات جوهرية هنبلغ بيها عبر الإيميل وإشعار على الموقع قبل سريانها بـ14 يوم على الأقل. الاستخدام المستمر للخدمة بعد تاريخ السريان بيعتبر قبولاً.",
      ],
    },
    {
      heading_en: "Contact",
      heading_ar: "تواصل معنا",
      body_en: ["Questions about these Terms: [CONTACT_EMAIL]."],
      body_ar: ["أسئلة عن الشروط دي: [CONTACT_EMAIL]."],
    },
  ],
};

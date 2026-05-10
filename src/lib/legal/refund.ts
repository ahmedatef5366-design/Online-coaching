import type { LegalDocument } from "@/components/legal/legal-page";

// Initial refund policy draft. Egyptian Consumer Protection Law (Law
// 181/2018) generally requires a meaningful cooling-off period for distance
// contracts. Validate the exact periods and exceptions with a lawyer before
// publishing.
export const refundDoc: LegalDocument = {
  title_en: "Refund Policy",
  title_ar: "سياسة الاسترداد",
  effective_date_en: "Last updated: 2025-01-01 — initial draft",
  effective_date_ar: "آخر تحديث: 2025-01-01 — مسودة أولية",
  intro_en:
    "We want you to be confident in your investment. This Refund Policy explains when refunds are available and how to request one.",
  intro_ar:
    "عاوزينك تبقى مطمن في استثمارك. سياسة الاسترداد دي بتشرح إمتى ممكن تسترد فلوسك وإزاي تقدم الطلب.",
  sections: [
    {
      heading_en: "7-day cooling-off period",
      heading_ar: "فترة 7 أيام للتراجع",
      body_en: [
        "If you have not yet started your program — meaning the first coaching call, training plan delivery, or 1:1 messaging has not occurred — you may request a full refund within 7 days of payment.",
      ],
      body_ar: [
        "لو ما بدأتش البرنامج لسه — يعني ما حصلتش أول مكالمة تدريب أو تسليم خطة تدريب أو تواصل مباشر — تقدر تطلب استرداد كامل خلال 7 أيام من تاريخ الدفع.",
      ],
    },
    {
      heading_en: "After the program starts",
      heading_ar: "بعد بدء البرنامج",
      body_en: [
        "Once your training plan is delivered or the first coaching call has taken place, refunds are evaluated case by case based on weeks completed.",
        "Pro-rated refunds may be issued for unused weeks at our discretion. Completed weeks, custom-built plans, and one-time consultation fees are non-refundable.",
      ],
      body_ar: [
        "بمجرد تسليم خطة التدريب أو حدوث أول مكالمة، الاسترداد بيتم تقييمه حالة بحالة حسب الأسابيع المكتملة.",
        "ممكن نصدر استرداد جزئي للأسابيع غير المستخدمة حسب تقديرنا. الأسابيع المكتملة، الخطط المخصصة، ورسوم الاستشارة لمرة واحدة غير قابلة للاسترداد.",
      ],
    },
    {
      heading_en: "Medical exception",
      heading_ar: "الاستثناء الطبي",
      body_en: [
        "If a medical condition or injury (verified by a doctor's note) prevents you from continuing the program, we will pause your subscription for up to 90 days at no cost. If pausing is not feasible, we will issue a pro-rated refund for the remaining weeks.",
      ],
      body_ar: [
        "لو حالة طبية أو إصابة (بشهادة طبية) منعتك من إكمال البرنامج، هنوقف اشتراكك مؤقتًا لمدة تصل لـ90 يوم مجانًا. لو الإيقاف مش ممكن، هنصدر استرداد جزئي للأسابيع المتبقية.",
      ],
    },
    {
      heading_en: "Non-refundable items",
      heading_ar: "العناصر غير القابلة للاسترداد",
      body_en: [
        "The following are non-refundable except where required by Egyptian Consumer Protection Law (Law 181/2018):",
        "Completed coaching weeks where check-ins, programming, or messaging support were provided.",
        "Custom-built training plans, nutrition plans, or assessments delivered as digital downloads.",
        "Add-ons or one-time services (single consultation calls, video reviews) once delivered.",
      ],
      body_ar: [
        "الحاجات التالية مش قابلة للاسترداد إلا لو القانون المصري لحماية المستهلك (رقم 181/2018) بيقتضي غير كده:",
        "أسابيع التدريب المكتملة اللي حصلت فيها متابعات أو برمجة أو دعم بالرسائل.",
        "خطط التدريب أو التغذية المخصصة أو التقييمات المسلّمة كملفات رقمية.",
        "الإضافات أو الخدمات لمرة واحدة (مكالمة استشارة منفردة، مراجعة فيديو) بعد تسليمها.",
      ],
    },
    {
      heading_en: "How to request a refund",
      heading_ar: "إزاي تطلب الاسترداد",
      body_en: [
        "Email [CONTACT_EMAIL] from the email address used for your application or purchase, including: your full name, the date of payment, the package purchased, and the reason for the refund request.",
        "We aim to respond within 3 business days and to process approved refunds within 10–14 business days. Refunds are issued to the original payment method.",
      ],
      body_ar: [
        "ابعت إيميل لـ[CONTACT_EMAIL] من نفس الإيميل اللي استخدمته في التقديم أو الشراء، متضمن: اسمك بالكامل، تاريخ الدفع، الباقة اللي اشتريتها، وسبب طلب الاسترداد.",
        "بنرد خلال 3 أيام عمل، وبنعالج الاستردادات الموافق عليها خلال 10–14 يوم عمل. الاسترداد بيتم على نفس وسيلة الدفع الأصلية.",
      ],
    },
    {
      heading_en: "Chargebacks",
      heading_ar: "النزاعات البنكية (Chargebacks)",
      body_en: [
        "Please contact us first before filing a chargeback with your bank or card issuer. Most issues can be resolved directly. Filing a chargeback without contacting us may result in account termination and disqualification from future services.",
      ],
      body_ar: [
        "من فضلك تواصل معانا الأول قبل ما تقدم نزاع بنكي للبنك أو شركة الكارت. أغلب المشاكل بتتحل مباشرة. تقديم نزاع بنكي من غير التواصل معانا ممكن يؤدي لإنهاء الحساب وعدم الأهلية للخدمات المستقبلية.",
      ],
    },
  ],
};

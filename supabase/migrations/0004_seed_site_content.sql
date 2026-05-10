-- =============================================================================
-- Seed: default landing-page content (CMS)
-- =============================================================================
-- The public landing page reads these rows; admins edit them from the CMS.
-- Each section_key maps to a section component; content_json is the editable
-- payload for that section.
-- -----------------------------------------------------------------------------

insert into public.site_content (section_key, content_json, is_published)
values
  ('hero', jsonb_build_object(
    'headline_en', 'Build the body you actually want.',
    'headline_ar', 'ابني الجسم اللي إنت عايزه فعلاً.',
    'subheadline_en', 'Personalized coaching, smart nutrition, and daily accountability — all in one place.',
    'subheadline_ar', 'كوتشينج شخصي، تغذية ذكية، ومتابعة يومية — كل ده في مكان واحد.',
    'cta_text_en', 'Start your journey',
    'cta_text_ar', 'ابدأ رحلتك',
    'background_url', ''
  ), true),
  ('features', jsonb_build_object(
    'items', jsonb_build_array(
      jsonb_build_object(
        'icon', 'Dumbbell',
        'title_en', 'Personalized Workout Plan',
        'title_ar', 'خطة تمرين مخصصة',
        'desc_en', 'Programs built around your level, schedule, and goals.',
        'desc_ar', 'برامج مصممة حسب مستواك وجدولك وأهدافك.'
      ),
      jsonb_build_object(
        'icon', 'Apple',
        'title_en', 'Flexible Nutrition System',
        'title_ar', 'نظام تغذية مرن',
        'desc_en', 'Hit your macros without giving up the foods you love.',
        'desc_ar', 'وصّل أهدافك من غير ما تتنازل عن الأكل اللي بتحبه.'
      ),
      jsonb_build_object(
        'icon', 'Activity',
        'title_en', 'Daily Check-in & Tracking',
        'title_ar', 'متابعة يومية',
        'desc_en', 'Stay accountable with quick nightly check-ins.',
        'desc_ar', 'اتابع نفسك يومياً بفورم سريع كل ليلة.'
      ),
      jsonb_build_object(
        'icon', 'MessageCircle',
        'title_en', 'Direct Coach Access',
        'title_ar', 'تواصل مباشر مع الكوتش',
        'desc_en', 'Real feedback from a real coach — not a chatbot.',
        'desc_ar', 'فيدباك حقيقي من كوتش حقيقي — مش بوت.'
      ),
      jsonb_build_object(
        'icon', 'Camera',
        'title_en', 'Visual & Metric Progress',
        'title_ar', 'تتبع التقدم بالصور والأرقام',
        'desc_en', 'Track weight, measurements, and progress photos in one place.',
        'desc_ar', 'تابع وزنك ومقاساتك وصور التقدم في مكان واحد.'
      )
    )
  ), true),
  ('how_it_works', jsonb_build_object(
    'steps', jsonb_build_array(
      jsonb_build_object('title_en', 'Join', 'title_ar', 'سجّل', 'desc_en', 'Sign up and share your goals.', 'desc_ar', 'سجّل وقولنا هدفك.'),
      jsonb_build_object('title_en', 'Get Your Plan', 'title_ar', 'استلم برنامجك', 'desc_en', 'Receive a custom workout + nutrition plan.', 'desc_ar', 'هتستلم برنامج تمرين وتغذية مخصص ليك.'),
      jsonb_build_object('title_en', 'Track & Transform', 'title_ar', 'تابع واتغير', 'desc_en', 'Log workouts and check in daily — we adjust as you go.', 'desc_ar', 'سجّل تمرينك وعمل تشيك-إن يومي — احنا بنعدل معاك.')
    )
  ), true),
  ('testimonials', jsonb_build_object(
    'is_visible', true,
    'items', jsonb_build_array()
  ), true),
  ('pricing', jsonb_build_object(
    'is_visible', false,
    'tiers', jsonb_build_array()
  ), true),
  ('cta_footer', jsonb_build_object(
    'headline_en', 'Ready to start?',
    'headline_ar', 'جاهز تبدأ؟',
    'cta_text_en', 'Sign up now',
    'cta_text_ar', 'سجّل دلوقتي'
  ), true),
  ('theme', jsonb_build_object(
    'primary', '#a3e635',
    'accent', '#f97316',
    'background', '#0f0f0f'
  ), true)
on conflict (section_key) do nothing;

export interface EducationArticle {
  id: string;
  title: string;
  category: "HYPERTENSION" | "NUTRITION" | "WARNING_SIGNS" | "POSTPARTUM";
  summary: string;
  content: string; // Plain text or safe markdown
  readTimeMinutes: number;
  source: string;
  sourceUrl?: string;
  videoUrl?: string;
}

/**
 * Static Education Content
 *
 * CLINICAL SAFETY:
 * - Hardcoded content to ensure clinical accuracy
 * - No dynamic generation
 * - Curated from reputable sources (ACOG, WHO, Preeclampsia Foundation)
 * - Non-alarmist language
 */
export const EDUCATION_CONTENT: EducationArticle[] = [
  {
    id: "understanding-bp",
    title: "Understanding Blood Pressure in Pregnancy",
    category: "HYPERTENSION",
    summary:
      "Learn what blood pressure numbers mean and why they matter during pregnancy.",
    content: `Blood pressure is the force of your blood pushing against the walls of your arteries. It is measured with two numbers:

1. Systolic (top number): The pressure when your heart beats.
2. Diastolic (bottom number): The pressure when your heart rests between beats.

In pregnancy, it's important to keep track of these numbers. A normal reading is typically below 120/80 mmHg. If your numbers are higher, your healthcare provider will want to monitor you more closely to ensure both you and your baby stay healthy.`,
    readTimeMinutes: 3,
    source: "World Health Organization (WHO) patient information on hypertension in pregnancy",
    sourceUrl:
      "https://www.who.int/health-topics/hypertension#tab=tab_1",
    videoUrl:
      "https://www.preeclampsia.org/video-library",
  },
  {
    id: "warning-signs",
    title: "Warning Signs to Watch For",
    category: "WARNING_SIGNS",
    summary:
      "Key symptoms that should prompt you to call your healthcare provider.",
    content: `Most pregnancies go smoothly, but knowing which symptoms to watch for can help you get care quickly if needed. Contact your provider if you experience:

- Severe headaches that won't go away with medication
- Changes in vision (blurring, flashing lights, or spots)
- Sudden swelling in your face or hands
- Pain in the upper right side of your belly
- Trouble breathing
- Nausea or vomiting (especially after mid-pregnancy)

If you are unsure, it is always safer to call your provider and ask.`,
    readTimeMinutes: 4,
    source:
      "Preeclampsia Foundation - 7 Signs and Symptoms Every Pregnant Woman Should Know",
    sourceUrl:
      "https://www.preeclampsia.org/health-information/signs-and-symptoms",
    videoUrl:
      "https://www.preeclampsia.org/video-library",
  },
  {
    id: "nutrition-hypertension",
    title: "Nutrition for Healthy Blood Pressure",
    category: "NUTRITION",
    summary: "Dietary tips to help manage blood pressure naturally.",
    content: `Eating a balanced diet is good for you and your baby. To help support healthy blood pressure:

- Stay hydrated: Drink plenty of water throughout the day.
- Watch sodium intake: Try to limit processed foods which are often high in salt.
- Eat plenty of fruits and vegetables: These provide essential nutrients like potassium.
- Choose whole grains: Brown rice, oats, and whole wheat bread are great options.

Always talk to your doctor or a nutritionist before making major changes to your diet.`,
    readTimeMinutes: 3,
    source:
      "American College of Obstetricians and Gynecologists (ACOG) – Nutrition During Pregnancy",
    sourceUrl:
      "https://www.acog.org/womens-health/faqs/nutrition-during-pregnancy",
    videoUrl: undefined,
  },
  {
    id: "postpartum-care",
    title: "Taking Care After Birth",
    category: "POSTPARTUM",
    summary:
      "Why monitoring your health remains important after your baby arrives.",
    content: `The postpartum period (after birth) is a time of recovery. It is important to continue listening to your body.

Some conditions, like postpartum preeclampsia, can occur even after the baby is born. Continue to watch for severe headaches, vision changes, or shortness of breath.

Make sure to attend your postpartum check-ups so your provider can ensure you are healing well.`,
    readTimeMinutes: 2,
    source:
      "American College of Obstetricians and Gynecologists (ACOG) – Postpartum Preeclampsia information",
    sourceUrl:
      "https://www.acog.org/womens-health/faqs/preeclampsia-and-high-blood-pressure-during-pregnancy",
    videoUrl:
      "https://www.preeclampsia.org/video-library",
  },
];

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
  {
    id: "preeclampsia-eclampsia-overview",
    title: "Preeclampsia and Eclampsia: What You Should Know",
    category: "HYPERTENSION",
    summary:
      "Overview of causes, warning signs, and care for preeclampsia and eclampsia.",
    content: `Preeclampsia is a blood pressure condition that usually develops after 20 weeks of pregnancy. It involves high blood pressure and signs that organs such as the kidneys or liver are under strain. If it is not treated, it can progress to eclampsia, which includes seizures. Early recognition and close medical care greatly reduce the chance of serious problems.

Diagnosis

- Blood pressure at or above 140/90 mmHg on more than one occasion
- Protein in the urine (proteinuria)
- Sometimes other changes in blood tests or organ function

Risk factors

- First pregnancy
- Multiple pregnancy (twins, triplets, etc.)
- History of high blood pressure, diabetes, kidney disease, or autoimmune disease
- Obesity
- Family history of preeclampsia

Warning symptoms

- Severe or persistent headache
- Changes in vision (blurred vision, flashing lights, or spots)
- Pain in the upper right side of the abdomen
- Nausea or vomiting after the first trimester
- Sudden swelling of the face, hands, or around the eyes
- Shortness of breath

Possible complications

- Seizures (eclampsia)
- HELLP syndrome (problems with the liver and blood clotting)
- Problems with the kidneys, liver, brain, or lungs
- Placental abruption (the placenta pulling away from the uterus)
- Restricted growth of the baby or early birth

Treatment and monitoring

- Close monitoring of blood pressure, urine, and blood tests
- Medications to lower blood pressure when needed
- Magnesium sulfate in some cases to help prevent seizures
- Corticosteroids to help the baby's lungs if early delivery is likely
- Timing of birth based on the health of you and your baby

After pregnancy

Preeclampsia can sometimes develop after birth (postpartum preeclampsia), usually within the first six weeks. Headache, vision changes, shortness of breath, or severe pain after delivery should be checked urgently.

Long-term health

Women who have had preeclampsia have a higher chance of high blood pressure, heart disease, and stroke later in life than women who did not. Regular follow-up with a primary care provider is important.

Prevention and self-care

- Attend all antenatal and postpartum visits
- Have blood pressure and urine checked as recommended
- Report warning symptoms promptly
- Follow advice on healthy eating, activity, and weight management when appropriate
- Take low-dose aspirin and calcium supplements if recommended by your care team

This summary is based on guidance from the World Health Organization and other international expert groups.`,
    readTimeMinutes: 8,
    source:
      "World Health Organization (WHO) and international guidelines on preeclampsia and eclampsia",
    sourceUrl:
      "https://www.who.int/health-topics/hypertension#tab=tab_1",
    videoUrl:
      "https://www.msdmanuals.com/professional/multimedia/video/overview-of-preeclampsia-and-eclampsia?utm_source=chatgpt.com",
  },
];

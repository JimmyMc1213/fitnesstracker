# App Review Reply Draft (FTI-96)

Hello App Review team,

Thank you for the detailed feedback on New You AI 1.0 (build 31). We have addressed each issue in build **32** as follows:

**2.3.10 Accurate Metadata / Screenshots**  
We replaced App Store screenshots with captures of the real iOS app UI (no nested device mockups or non-iOS status bars). Screenshots now show the main features: Future You, plan, home, workout, nutrition, and paywall.

**5.1.1 / 5.1.2 Privacy — third-party AI**  
Before a user can upload a Future You photo, the app now clearly states that the photo is processed on our servers and shared with **OpenAI** (our third-party AI image provider) to generate the preview. Consent requires an explicit checkbox, and Privacy Policy / Terms links remain on that screen.

**Guideline 4 Design**  
We reduced visual density on the paywall, plan-ready, and nutrition screens (spacing/hierarchy) so primary tasks are clearer on iPhone and in iPhone compatibility mode on iPad. The app remains phone-primary (`supportsTablet` false).

**1.4.1 Safety — medical/nutrition citations**  
Calorie and macro targets now include an in-app “How we calculate this” / Sources section with links to Mifflin–St Jeor, activity-multiplier references, and protein guidance near the recommendations (fuel editor, plan-ready, and Nutrition tab).

**3.1.2(c) Subscription pricing**  
On the paywall, the **billed amount** is now the primary price (`$69.99/yr` for yearly, `$14.99/mo` for monthly). Any monthly-equivalent copy (e.g. “Just $5.83/mo”) is shown in a subordinate size/style.

**2.1(b) In-App Purchases**  
Both auto-renewable products are included with this submission:  
- `newyouai_pro_monthly`  
- `newyouai_pro_yearly`  

**How to verify**  
1. Create/sign in with any email/password (or Sign in with Apple).  
2. Complete onboarding through the Future You photo step — note OpenAI consent before upload.  
3. On paywall, confirm yearly billed amount is primary.  
4. After subscribe (sandbox), open Nutrition / plan targets and open the Sources links.

Support: support@newyouai.app

Thank you,  
Jimmy McCarthy  
New You AI

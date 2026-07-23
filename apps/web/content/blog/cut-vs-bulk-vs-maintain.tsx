import Link from "next/link";

import type { BlogPostMeta } from "../../lib/blog/types";

export const meta: BlogPostMeta = {
  slug: "cut-vs-bulk-vs-maintain",
  title: "Cut, bulk, or maintain: which goal is right for you?",
  description:
    "Cut, bulk, or maintain? A plain-language guide to picking your NewYou goal, with signs each path fits and when to switch later.",
  publishedAt: "2026-07-22",
  readingTimeMinutes: 8,
};

export function Content() {
  return (
    <>
      <p>
        The first major choice in NewYou onboarding is your goal: <strong>cut</strong>,{" "}
        <strong>bulk</strong>, or <strong>maintain</strong>. That pick sets your calorie targets, training
        emphasis, and the kind of{" "}
        <Link href="/blog/what-is-future-you">Future You</Link> preview you see. Cut means eating below
        maintenance to lose fat. Bulk means a structured surplus to build muscle. Maintain means holding
        weight steady while improving habits and body composition. Here is how to choose without
        overthinking it.
      </p>

      <h2>Cut: lose fat and look leaner</h2>
      <p>
        Choose <strong>cut</strong> when you want to lose body fat and look leaner. NewYou sets nutrition
        below maintenance so you lose weight at the pace you selected: slow and steady, or slightly faster
        if that matches your timeline.
      </p>
      <p>
        <strong>Cut is probably right if:</strong>
      </p>
      <ul>
        <li>You carry extra weight you want to lose before chasing size</li>
        <li>You want visible definition, a tighter waist, or a beach-ready look</li>
        <li>You have a deadline in mind, such as a wedding, vacation, or summer</li>
      </ul>
      <p>
        <strong>Watch out for:</strong> cutting too hard, too fast. NewYou paces targets from your stats,
        but crash dieting still backfires. Consistency beats extreme deficits every time.
      </p>

      <h2>Bulk: build muscle and fill out</h2>
      <p>
        Choose <strong>bulk</strong> when you want to gain muscle and look stronger. Calories sit above
        maintenance so your body has fuel to grow. That is not a license to eat randomly. It is a
        structured surplus aligned with protein and training in your plan.
      </p>
      <p>
        <strong>Bulk is probably right if:</strong>
      </p>
      <ul>
        <li>You are already relatively lean and want more size</li>
        <li>Your lifts are stalling and recovery still feels solid</li>
        <li>You care about broader shoulders, bigger arms, or a fuller physique</li>
      </ul>
      <p>
        <strong>Watch out for:</strong> dirty bulking. A modest surplus with enough protein beats eating
        everything in sight and gaining mostly fat.
      </p>

      <h2>Maintain: stay steady and get healthier</h2>
      <p>
        Choose <strong>maintain</strong> when your weight is fine but you want better composition,
        energy, habits, or overall fitness without a big move on the scale.
      </p>
      <p>
        <strong>Maintain is probably right if:</strong>
      </p>
      <ul>
        <li>You just finished a long cut or bulk and want to settle</li>
        <li>You want more energy, better routines, or a subtle tone-up</li>
        <li>You are new to training and need consistency before chasing extremes</li>
      </ul>
      <p>
        Maintain is not standing still. You can still get stronger, eat better, and look noticeably
        healthier. Your Future You preview reflects a glow-up, not a dramatic transformation.
      </p>

      <h2>Quick decision guide</h2>
      <p>
        If you are overweight and new to the gym, <strong>cut</strong> is the most common starting point.
        If you are skinny and have never lifted consistently, <strong>bulk</strong> or a lean bulk often
        fits. If life is chaotic and you mainly need structure, <strong>maintain</strong> is underrated.
      </p>
      <p>
        You can change your goal later in Settings as your body and priorities shift. The point is to pick
        a direction, see your Future You, and start building toward it.
      </p>

      <h2>Frequently asked questions</h2>
      <p>
        <strong>Can I switch from cut to bulk later?</strong> Yes. Many people cut first, then bulk once
        they are lean enough to tolerate a surplus. NewYou lets you update your goal when your plan
        changes.
      </p>
      <p>
        <strong>Will maintain help me lose fat?</strong> Maintain focuses on holding weight while
        improving habits and composition. Fat loss is usually faster on a cut. Maintain is best when the
        scale is already where you want it.
      </p>
      <p>
        <strong>Does my goal change my Future You preview?</strong> Yes. Cut previews emphasize leanness
        and definition. Bulk previews emphasize size and muscle. Maintain previews show a subtler
        tone-up. Learn more in{" "}
        <Link href="/blog/what-is-future-you">What is Future You?</Link>.
      </p>
      <p>
        <strong>What if I pick wrong?</strong> You are not locked in forever. Adjust in Settings, refresh
        your preview when ready, and keep logging workouts and meals so the plan stays honest.
      </p>
    </>
  );
}

import {
  getFutureYouGenericMotivations,
  getFutureYouSpecificMotivations,
} from "./futureYouMotivations";
import { OnboardingSegment } from "./OnboardingSegment";
import type { NutritionGoal, UserGender } from "./types";

type Props = {
  goal: NutritionGoal;
  gender: UserGender;
  selectedId: string | undefined;
  onSelect: (motivationId: string, isGeneric: boolean) => void;
};

function MotivationSection({
  label,
  motivations,
  selectedId,
  onSelect,
}: {
  label: string;
  motivations: ReturnType<typeof getFutureYouGenericMotivations>;
  selectedId: string | undefined;
  onSelect: Props["onSelect"];
}) {
  if (motivations.length === 0) return null;

  return (
    <section className="future-you-motivation-step__section">
      <h3 className="future-you-motivation-step__section-label">{label}</h3>
      <div className="future-you-motivation-step__chips">
        {motivations.map((motivation) => (
          <OnboardingSegment
            key={motivation.id}
            layout="inline"
            selected={selectedId === motivation.id}
            onClick={() => onSelect(motivation.id, motivation.isGeneric)}
          >
            {motivation.label}
          </OnboardingSegment>
        ))}
      </div>
    </section>
  );
}

export function OnboardingFutureYouMotivation({ goal, gender, selectedId, onSelect }: Props) {
  const generics = getFutureYouGenericMotivations(goal, gender);
  const specifics = getFutureYouSpecificMotivations(goal, gender);

  return (
    <div className="future-you-motivation-step">
      <MotivationSection
        label="Popular"
        motivations={generics}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      <MotivationSection
        label="More specific"
        motivations={specifics}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </div>
  );
}

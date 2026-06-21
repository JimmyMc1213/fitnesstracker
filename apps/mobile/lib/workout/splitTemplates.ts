import { MovementPattern, Experience } from './exerciseLibrary';

export type SessionLength = 'under_30' | '30_45' | '45_60' | '60_90' | '90_plus';
export type SplitType = '1_fullbody' | '2_fullbody_ab' | '3_ppl' | '3_fullbody_abc' | '4_upper_lower' | '5_pplul' | '6_ppl' | '6_pplrul';

export interface SessionTemplate {
  dayLabel: string;
  sessionName: string;
  movementPatterns: MovementPattern[];
  volumeByLength: Record<SessionLength, number>;
}

export interface SplitTemplate {
  splitType: SplitType;
  days: number;
  sessions: SessionTemplate[];
}

// Volume = number of exercises per session
const VOLUME: Record<SessionLength, number> = {
  under_30: 3,
  '30_45': 4,
  '45_60': 6,
  '60_90': 8,
  '90_plus': 10
};

// Rep ranges by experience
export const REP_RANGES: Record<Experience, { sets: number; repsLow: number; repsHigh: number }> = {
  beginner:     { sets: 3, repsLow: 12, repsHigh: 15 },
  intermediate: { sets: 3, repsLow: 8,  repsHigh: 12 },
  advanced:     { sets: 3, repsLow: 4,  repsHigh: 8  }
};

// Set counts by session length
export const SET_COUNT: Record<SessionLength, number> = {
  under_30: 2,
  '30_45':  3,
  '45_60':  3,
  '60_90':  4,
  '90_plus': 4
};

export const splitTemplates: SplitTemplate[] = [

  // ─── 1 DAY - FULL BODY ─────────────────────────────────────────────
  {
    splitType: '1_fullbody',
    days: 1,
    sessions: [
      {
        dayLabel: 'Day 1',
        sessionName: 'Full body',
        movementPatterns: [
          'squat_pattern',
          'horizontal_push',
          'vertical_pull',
          'hinge_pattern',
          'vertical_push',
          'horizontal_pull',
          'bicep_curl',
          'tricep_extension',
          'core_anti_extension'
        ],
        volumeByLength: VOLUME
      }
    ]
  },

  // ─── 2 DAY - FULL BODY A/B ─────────────────────────────────────────
  {
    splitType: '2_fullbody_ab',
    days: 2,
    sessions: [
      {
        dayLabel: 'Day 1',
        sessionName: 'Full body A',
        movementPatterns: [
          'squat_pattern',
          'horizontal_push',
          'vertical_pull',
          'hinge_pattern',
          'lateral_raise',
          'bicep_curl',
          'tricep_extension',
          'core_anti_extension'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 2',
        sessionName: 'Full body B',
        movementPatterns: [
          'hinge_pattern',
          'vertical_push',
          'horizontal_pull',
          'squat_pattern',
          'rear_delt',
          'bicep_curl',
          'tricep_extension',
          'core_flexion'
        ],
        volumeByLength: VOLUME
      }
    ]
  },

  // ─── 3 DAY - FULL BODY A/B/C ───────────────────────────────────────
  {
    splitType: '3_fullbody_abc',
    days: 3,
    sessions: [
      {
        dayLabel: 'Day 1',
        sessionName: 'Full body A',
        movementPatterns: [
          'squat_pattern',
          'horizontal_push',
          'vertical_pull',
          'lateral_raise',
          'bicep_curl',
          'core_anti_extension'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 2',
        sessionName: 'Full body B',
        movementPatterns: [
          'hinge_pattern',
          'vertical_push',
          'horizontal_pull',
          'rear_delt',
          'tricep_extension',
          'core_flexion'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 3',
        sessionName: 'Full body C',
        movementPatterns: [
          'squat_pattern',
          'horizontal_push',
          'vertical_pull',
          'hinge_pattern',
          'bicep_curl',
          'tricep_extension',
          'core_rotation'
        ],
        volumeByLength: VOLUME
      }
    ]
  },

  // ─── 3 DAY - PPL ───────────────────────────────────────────────────
  {
    splitType: '3_ppl',
    days: 3,
    sessions: [
      {
        dayLabel: 'Day 1',
        sessionName: 'Push',
        movementPatterns: [
          'horizontal_push',
          'vertical_push',
          'horizontal_push',
          'lateral_raise',
          'rear_delt',
          'tricep_extension',
          'tricep_extension',
          'vertical_push'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 2',
        sessionName: 'Pull',
        movementPatterns: [
          'vertical_pull',
          'horizontal_pull',
          'vertical_pull',
          'horizontal_pull',
          'rear_delt',
          'bicep_curl',
          'bicep_curl',
          'lateral_raise'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 3',
        sessionName: 'Legs',
        movementPatterns: [
          'squat_pattern',
          'hinge_pattern',
          'leg_press_pattern',
          'leg_curl_pattern',
          'squat_pattern',
          'hinge_pattern',
          'calf_raise',
          'core_anti_extension'
        ],
        volumeByLength: VOLUME
      }
    ]
  },

  // ─── 4 DAY - UPPER/LOWER ───────────────────────────────────────────
  {
    splitType: '4_upper_lower',
    days: 4,
    sessions: [
      {
        dayLabel: 'Day 1',
        sessionName: 'Upper strength',
        movementPatterns: [
          'horizontal_push',
          'vertical_pull',
          'vertical_push',
          'horizontal_pull',
          'lateral_raise',
          'bicep_curl',
          'tricep_extension',
          'rear_delt'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 2',
        sessionName: 'Lower strength',
        movementPatterns: [
          'squat_pattern',
          'hinge_pattern',
          'leg_press_pattern',
          'leg_curl_pattern',
          'squat_pattern',
          'calf_raise',
          'core_anti_extension',
          'core_flexion'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 3',
        sessionName: 'Upper hypertrophy',
        movementPatterns: [
          'horizontal_push',
          'horizontal_pull',
          'vertical_push',
          'vertical_pull',
          'lateral_raise',
          'rear_delt',
          'bicep_curl',
          'tricep_extension'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 4',
        sessionName: 'Lower hypertrophy',
        movementPatterns: [
          'squat_pattern',
          'hinge_pattern',
          'leg_press_pattern',
          'leg_curl_pattern',
          'hinge_pattern',
          'calf_raise',
          'core_flexion',
          'core_rotation'
        ],
        volumeByLength: VOLUME
      }
    ]
  },

  // ─── 5 DAY - PPLUL ─────────────────────────────────────────────────
  {
    splitType: '5_pplul',
    days: 5,
    sessions: [
      {
        dayLabel: 'Day 1',
        sessionName: 'Push',
        movementPatterns: [
          'horizontal_push',
          'vertical_push',
          'horizontal_push',
          'lateral_raise',
          'tricep_extension',
          'tricep_extension',
          'rear_delt',
          'lateral_raise'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 2',
        sessionName: 'Pull',
        movementPatterns: [
          'vertical_pull',
          'horizontal_pull',
          'vertical_pull',
          'horizontal_pull',
          'rear_delt',
          'bicep_curl',
          'bicep_curl',
          'lateral_raise'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 3',
        sessionName: 'Legs',
        movementPatterns: [
          'squat_pattern',
          'hinge_pattern',
          'leg_press_pattern',
          'leg_curl_pattern',
          'squat_pattern',
          'hinge_pattern',
          'calf_raise',
          'core_anti_extension'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 4',
        sessionName: 'Upper',
        movementPatterns: [
          'horizontal_push',
          'vertical_pull',
          'vertical_push',
          'horizontal_pull',
          'lateral_raise',
          'rear_delt',
          'bicep_curl',
          'tricep_extension'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 5',
        sessionName: 'Lower',
        movementPatterns: [
          'squat_pattern',
          'hinge_pattern',
          'leg_press_pattern',
          'leg_curl_pattern',
          'hinge_pattern',
          'calf_raise',
          'core_flexion',
          'core_rotation'
        ],
        volumeByLength: VOLUME
      }
    ]
  },

  // ─── 6 DAY - PPL/PPL ───────────────────────────────────────────────
  {
    splitType: '6_ppl',
    days: 6,
    sessions: [
      {
        dayLabel: 'Day 1',
        sessionName: 'Push A',
        movementPatterns: [
          'horizontal_push',
          'vertical_push',
          'horizontal_push',
          'lateral_raise',
          'tricep_extension',
          'tricep_extension',
          'rear_delt',
          'lateral_raise'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 2',
        sessionName: 'Pull A',
        movementPatterns: [
          'vertical_pull',
          'horizontal_pull',
          'vertical_pull',
          'rear_delt',
          'bicep_curl',
          'bicep_curl',
          'horizontal_pull',
          'lateral_raise'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 3',
        sessionName: 'Legs A',
        movementPatterns: [
          'squat_pattern',
          'hinge_pattern',
          'leg_press_pattern',
          'leg_curl_pattern',
          'squat_pattern',
          'calf_raise',
          'core_anti_extension',
          'core_flexion'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 4',
        sessionName: 'Push B',
        movementPatterns: [
          'horizontal_push',
          'vertical_push',
          'horizontal_push',
          'lateral_raise',
          'rear_delt',
          'tricep_extension',
          'tricep_extension',
          'lateral_raise'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 5',
        sessionName: 'Pull B',
        movementPatterns: [
          'horizontal_pull',
          'vertical_pull',
          'horizontal_pull',
          'vertical_pull',
          'rear_delt',
          'bicep_curl',
          'bicep_curl',
          'core_rotation'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 6',
        sessionName: 'Legs B',
        movementPatterns: [
          'hinge_pattern',
          'squat_pattern',
          'leg_press_pattern',
          'leg_curl_pattern',
          'hinge_pattern',
          'calf_raise',
          'core_flexion',
          'core_rotation'
        ],
        volumeByLength: VOLUME
      }
    ]
  },

  // ─── 6 DAY - PPLRUL ────────────────────────────────────────────────
  {
    splitType: '6_pplrul',
    days: 6,
    sessions: [
      {
        dayLabel: 'Day 1',
        sessionName: 'Push',
        movementPatterns: [
          'horizontal_push',
          'vertical_push',
          'horizontal_push',
          'lateral_raise',
          'rear_delt',
          'tricep_extension',
          'tricep_extension',
          'lateral_raise'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 2',
        sessionName: 'Pull',
        movementPatterns: [
          'vertical_pull',
          'horizontal_pull',
          'vertical_pull',
          'horizontal_pull',
          'rear_delt',
          'bicep_curl',
          'bicep_curl',
          'lateral_raise'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 3',
        sessionName: 'Legs',
        movementPatterns: [
          'squat_pattern',
          'hinge_pattern',
          'leg_press_pattern',
          'leg_curl_pattern',
          'squat_pattern',
          'hinge_pattern',
          'calf_raise',
          'core_anti_extension'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 4',
        sessionName: 'Rest / active recovery',
        movementPatterns: [],
        volumeByLength: { under_30: 0, '30_45': 0, '45_60': 0, '60_90': 0, '90_plus': 0 }
      },
      {
        dayLabel: 'Day 5',
        sessionName: 'Upper',
        movementPatterns: [
          'horizontal_push',
          'vertical_pull',
          'vertical_push',
          'horizontal_pull',
          'lateral_raise',
          'rear_delt',
          'bicep_curl',
          'tricep_extension'
        ],
        volumeByLength: VOLUME
      },
      {
        dayLabel: 'Day 6',
        sessionName: 'Lower',
        movementPatterns: [
          'squat_pattern',
          'hinge_pattern',
          'leg_press_pattern',
          'leg_curl_pattern',
          'hinge_pattern',
          'calf_raise',
          'core_flexion',
          'core_rotation'
        ],
        volumeByLength: VOLUME
      }
    ]
  }
];

export { VOLUME };
export default splitTemplates;

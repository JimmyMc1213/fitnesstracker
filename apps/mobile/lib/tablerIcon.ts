import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";

/** Shared prop shape for `@tabler/icons-react-native` icon components. */
export type TablerIcon = ComponentType<
  SvgProps & { size?: number | string; strokeWidth?: number | string }
>;

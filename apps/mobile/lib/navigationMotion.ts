type StackScreenOptions = {
  headerShown?: boolean;
  animation?:
    | "default"
    | "fade"
    | "fade_from_bottom"
    | "flip"
    | "simple_push"
    | "slide_from_bottom"
    | "slide_from_right"
    | "none";
  presentation?: "card" | "modal" | "transparentModal";
};

/** Default stack — no fade flash on group switches. */
export const defaultStackScreenOptions: StackScreenOptions = {
  headerShown: false,
};

export const pushStackScreenOptions: StackScreenOptions = {
  headerShown: false,
  animation: "slide_from_right",
};

export const modalStackScreenOptions: StackScreenOptions = {
  headerShown: false,
  presentation: "modal",
};

export const tabScreenOptions = {
  headerShown: false,
  tabBarShowLabel: false,
  sceneStyle: { flex: 1, backgroundColor: "transparent" },
};

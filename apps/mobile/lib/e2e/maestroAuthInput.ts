/** Maestro cannot type into iOS secureTextEntry fields — disable masking when this env is set. */
export function isMaestroE2eAuthInput(): boolean {
  return process.env.EXPO_PUBLIC_MAESTRO_E2E_AUTH === "true";
}

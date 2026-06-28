export {
  clientSupabaseKeyForFetch,
  createSupabaseClient,
  edgeFunctionApiKey,
  isSupabaseConfigured,
  type SupabaseEnv,
} from "./supabase/createSupabaseClient";
export * from "./invoke";
export {
  lookupFoodByBarcode,
  mapOffProduct,
  normalizeBarcodeDigits,
  offBarcodesMatch,
  OFF_BARCODE_PRODUCT_API,
  type OffBarcodeLookupPayload,
} from "./offBarcodeLookup";

import { describe, expect, it } from "vitest";

import { isFutureYouPhotoDataUrl, isLocalFutureYouPhotoUri } from "./futureYouPhotoUri";

describe("futureYouPhotoUri", () => {
  it("recognizes React Native photo URIs", () => {
    expect(isLocalFutureYouPhotoUri("file:///var/mobile/photo.jpg")).toBe(true);
    expect(isLocalFutureYouPhotoUri("content://media/external/images/1")).toBe(true);
    expect(isLocalFutureYouPhotoUri("ph://asset-id")).toBe(true);
  });

  it("recognizes data URLs", () => {
    expect(isFutureYouPhotoDataUrl("data:image/jpeg;base64,abc")).toBe(true);
    expect(isLocalFutureYouPhotoUri("data:image/jpeg;base64,abc")).toBe(false);
  });
});

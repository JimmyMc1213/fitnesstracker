import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

import {
  FUTURE_YOU_BUCKET,
  badUploadResponse,
  buildFutureYouSourcePath,
  unauthorizedResponse,
  validateFutureYouImageDataUrl,
  validateFutureYouUploadBytes,
} from "./guards.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AuthContext = {
  userId: string;
  userClient: ReturnType<typeof createClient>;
  adminClient: ReturnType<typeof createClient>;
};

async function resolveAuthenticatedContext(req: Request): Promise<AuthContext | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("future-you-upload: missing Supabase env");
    return null;
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error,
  } = await userClient.auth.getUser();
  if (error || !user) return null;

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return { userId: user.id, userClient, adminClient };
}

async function verifySourcePhotoStored(
  adminClient: ReturnType<typeof createClient>,
  path: string,
): Promise<boolean> {
  const { data, error } = await adminClient.storage.from(FUTURE_YOU_BUCKET).download(path);
  if (error || !data) return false;
  const bytes = new Uint8Array(await data.arrayBuffer());
  return bytes.length > 0;
}

async function readUploadFromRequest(req: Request) {
  const contentType = req.headers.get("Content-Type")?.toLowerCase() ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return badUploadResponse("Missing photo file.", 400, corsHeaders);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const validated = validateFutureYouUploadBytes(bytes);
    if (!validated.ok) {
      return badUploadResponse(validated.error, validated.status, corsHeaders);
    }

    return validated;
  }

  const body = await req.json().catch(() => ({}));
  const imageDataUrl = typeof body?.imageDataUrl === "string" ? body.imageDataUrl : "";
  if (!imageDataUrl.trim()) {
    return badUploadResponse("Missing photo. Send imageDataUrl or multipart file.", 400, corsHeaders);
  }

  const validated = validateFutureYouImageDataUrl(imageDataUrl);
  if (!validated.ok) {
    return badUploadResponse(validated.error, validated.status, corsHeaders);
  }

  return validated;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const auth = await resolveAuthenticatedContext(req);
    if (!auth) {
      return unauthorizedResponse(corsHeaders);
    }
    const { userId, adminClient } = auth;

    const validated = await readUploadFromRequest(req);
    if (validated instanceof Response) {
      return validated;
    }

    const uploadId = crypto.randomUUID();
    const { bytes, mimeType, extension } = validated.upload;
    const path = buildFutureYouSourcePath(userId, uploadId, extension);
    const storageMime = mimeType === "image/jpg" ? "image/jpeg" : mimeType;

    const { error: uploadError } = await adminClient.storage.from(FUTURE_YOU_BUCKET).upload(path, bytes, {
      contentType: storageMime,
      upsert: false,
    });

    if (uploadError) {
      console.error("future-you-upload: storage upload failed", uploadError);
      return new Response(JSON.stringify({ error: "Could not save your photo. Try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stored = await verifySourcePhotoStored(adminClient, path);
    if (!stored) {
      console.error("future-you-upload: photo missing after upload", { path, userId });
      await adminClient.storage.from(FUTURE_YOU_BUCKET).remove([path]).catch(() => undefined);
      return new Response(JSON.stringify({ error: "Could not save your photo. Try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        path,
        uploadId,
        bucket: FUTURE_YOU_BUCKET,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("future-you-upload error", e);
    return new Response(JSON.stringify({ error: "Photo upload failed. Try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

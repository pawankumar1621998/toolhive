// Instagram OAuth & Graph API helper
// Docs: https://developers.facebook.com/docs/instagram-api

const IG_GRAPH_BASE = "https://graph.instagram.com";
const META_GRAPH_BASE = "https://graph.facebook.com/v19.0";

// ─── Config ────────────────────────────────────────────────────────────────────

export function getMetaConfig() {
  return {
    appId:     process.env.INSTAGRAM_APP_ID ?? "",
    appSecret: process.env.INSTAGRAM_APP_SECRET ?? "",
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI ?? "https://toolhive.vercel.app/api/auth/instagram/callback",
  };
}

// ─── OAuth URL ─────────────────────────────────────────────────────────────────

export function getInstagramAuthUrl(state = "instagram_oauth"): string {
  const { appId, redirectUri } = getMetaConfig();
  const scopes = [
    "instagram_basic",
    "instagram_content_publish",
    "instagram_manage_comments",
    "instagram_manage_messages",
    "pages_read_engagement",
    "pages_messaging",
  ].join(",");

  return (
    `https://www.facebook.com/v19.0/dialog/oauth` +
    `?client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${scopes}` +
    `&response_type=code` +
    `&state=${state}`
  );
}

// ─── Token Exchange ─────────────────────────────────────────────────────────────

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}> {
  const { appId, appSecret, redirectUri } = getMetaConfig();

  const res = await fetch(
    `${META_GRAPH_BASE}/oauth/access_token` +
    `?grant_type=authorization_code` +
    `&client_id=${appId}` +
    `&client_secret=${appSecret}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&code=${code}`,
    { method: "GET", signal: AbortSignal.timeout(15_000) }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  return res.json();
}

// ─── Refresh Token ─────────────────────────────────────────────────────────────

export async function refreshAccessToken(token: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
}> {
  const { appId, appSecret } = getMetaConfig();
  const res = await fetch(
    `${META_GRAPH_BASE}/oauth/access_token` +
    `?grant_type=fb_exchange_token` +
    `&client_id=${appId}` +
    `&client_secret=${appSecret}` +
    `&fb_exchange_token=${token}`,
    { method: "GET", signal: AbortSignal.timeout(15_000) }
  );

  if (!res.ok) throw new Error("Token refresh failed");
  return res.json();
}

// ─── Get Instagram Business Account ─────────────────────────────────────────────

export async function getInstagramAccounts(accessToken: string): Promise<Array<{
  id: string;
  name: string;
  username: string;
  profile_picture_url: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
}>> {
  // Step 1: Get Facebook pages
  const pagesRes = await fetch(
    `${META_GRAPH_BASE}/me/accounts?access_token=${accessToken}`,
    { signal: AbortSignal.timeout(15_000) }
  );
  if (!pagesRes.ok) throw new Error("Failed to fetch Facebook pages");
  const pagesData = await pagesRes.json() as { data?: Array<{ id: string; name: string; access_token: string }> };
  const pages = pagesData.data ?? [];

  // Step 2: Get IG account for each page
  const igAccounts = [];
  for (const page of pages) {
    const igRes = await fetch(
      `${META_GRAPH_BASE}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`,
      { signal: AbortSignal.timeout(15_000) }
    );
    if (!igRes.ok) continue;
    const igData = await igRes.json() as { instagram_business_account?: { id: string } };
    if (!igData.instagram_business_account) continue;

    // Step 3: Get IG account details
    const igId = igData.instagram_business_account.id;
    const detailsRes = await fetch(
      `${IG_GRAPH_BASE}/${igId}?fields=id,name,username,profile_picture_url,followers_count,follows_count,media_count&access_token=${page.access_token}`,
      { signal: AbortSignal.timeout(15_000) }
    );
    if (!detailsRes.ok) continue;
    const details = await detailsRes.json();
    igAccounts.push({
      id: details.id,
      name: details.name,
      username: details.username,
      profile_picture_url: details.profile_picture_url ?? "",
      followers_count: details.followers_count ?? 0,
      follows_count: details.follows_count ?? 0,
      media_count: details.media_count ?? 0,
    });
  }

  return igAccounts;
}

// ─── Fetch Recent Comments ───────────────────────────────────────────────────

export async function getRecentComments(
  igAccountId: string,
  accessToken: string,
  limit = 50
): Promise<Array<{
  id: string;
  text: string;
  username: string;
  timestamp: string;
  hide_on_media: boolean;
  media: { id: string; caption: string; permalink: string } | null;
}>> {
  const res = await fetch(
    `${IG_GRAPH_BASE}/${igAccountId}/comments` +
    `?fields=id,text,username,timestamp,hide_on_media,media{id,caption,permalink}` +
    `&access_token=${accessToken}` +
    `&limit=${limit}`,
    { signal: AbortSignal.timeout(20_000) }
  );

  if (!res.ok) throw new Error("Failed to fetch comments");
  const data = await res.json() as { data?: Array<unknown> };
  return (data.data ?? []) as ReturnType<typeof getRecentComments> extends Promise<infer T> ? T : never;
}

// ─── Send DM ───────────────────────────────────────────────────────────────────

export async function sendDM(
  igAccountId: string,
  accessToken: string,
  recipientIgSid: string, // Instagram Scoped ID of the recipient
  message: string
): Promise<{ id: string; message: string }> {
  const res = await fetch(
    `${META_GRAPH_BASE}/${igAccountId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        recipient: { id: recipientIgSid },
        message: { text: message },
      }),
      signal: AbortSignal.timeout(20_000),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DM send failed: ${err}`);
  }

  return res.json();
}

// ─── Reply to Comment ─────────────────────────────────────────────────────────

export async function replyToComment(
  igAccountId: string,
  accessToken: string,
  commentId: string,
  message: string
): Promise<{ id: string; text: string }> {
  const res = await fetch(
    `${IG_GRAPH_BASE}/${commentId}/replies`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message,
        access_token: accessToken,
      }),
      signal: AbortSignal.timeout(20_000),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Comment reply failed: ${err}`);
  }

  return res.json();
}

// ─── Get Media (Posts) ────────────────────────────────────────────────────────

export async function getRecentMedia(
  igAccountId: string,
  accessToken: string,
  limit = 20
): Promise<Array<{ id: string; caption: string; permalink: string; timestamp: string; media_type: string; like_count: number; comments_count: number }>> {
  const res = await fetch(
    `${IG_GRAPH_BASE}/${igAccountId}/media` +
    `?fields=id,caption,permalink,timestamp,media_type,like_count,comments_count` +
    `&access_token=${accessToken}` +
    `&limit=${limit}`,
    { signal: AbortSignal.timeout(20_000) }
  );

  if (!res.ok) throw new Error("Failed to fetch media");
  const data = await res.json() as { data?: Array<unknown> };
  return (data.data ?? []) as ReturnType<typeof getRecentMedia> extends Promise<infer T> ? T : never;
}

// ─── Get Conversation Messages ─────────────────────────────────────────────────

export async function getConversationMessages(
  igAccountId: string,
  accessToken: string,
  conversationId: string,
  limit = 50
): Promise<Array<{ id: string; from: { id: string; email: string }; message: string; created_at: string }>> {
  const res = await fetch(
    `${META_GRAPH_BASE}/${conversationId}/messages` +
    `?fields=id,from,message,created_at` +
    `&access_token=${accessToken}` +
    `&limit=${limit}`,
    { signal: AbortSignal.timeout(20_000) }
  );

  if (!res.ok) throw new Error("Failed to fetch messages");
  const data = await res.json() as { data?: Array<unknown> };
  return (data.data ?? []) as ReturnType<typeof getConversationMessages> extends Promise<infer T> ? T : never;
}

// ─── Permission Check ───────────────────────────────────────────────────────────

export async function checkPermissions(accessToken: string, igAccountId: string): Promise<{
  hasMessaging: boolean;
  hasContentPublish: boolean;
  hasComments: boolean;
}> {
  const res = await fetch(
    `${META_GRAPH_BASE}/${igAccountId}/permissions?access_token=${accessToken}`,
    { signal: AbortSignal.timeout(10_000) }
  );

  if (!res.ok) return { hasMessaging: false, hasContentPublish: false, hasComments: false };

  const data = await res.json() as { data?: Array<{ permission: string; status: string }> };
  const perms = (data?.data ?? []).reduce<Record<string, string>>((acc, p) => {
    acc[p.permission] = p.status;
    return acc;
  }, {});

  return {
    hasMessaging: perms["instagram_manage_messages"] === "granted",
    hasContentPublish: perms["instagram_content_publish"] === "granted",
    hasComments: perms["instagram_manage_comments"] === "granted",
  };
}
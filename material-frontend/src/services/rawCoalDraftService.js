import config from "../config/config";

const RAW_COAL_DRAFT_KEY_PREFIX = "raw-material-coal:draft-entry-id";

const buildUserScopedKey = (userId = "") => {
  const normalizedUserId = String(userId || "anonymous").trim().toLowerCase();
  return `${RAW_COAL_DRAFT_KEY_PREFIX}:${normalizedUserId}`;
};

const cleanPayload = (payload = {}) =>
  Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (value === "" || value === undefined) return [key, null];
      if (typeof value === "number" && !Number.isFinite(value)) return [key, null];
      return [key, value];
    }),
  );

const buildRequestUrl = (path, userId = "") => {
  const userIdQuery = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return `${config.apiBaseUrl}${path}${userIdQuery}`;
};

export const getTrackedCoalDraftEntryId = (userId = "") =>
  localStorage.getItem(buildUserScopedKey(userId)) || "";

export const trackCoalDraftEntryId = (userId = "", entryId = "") => {
  const normalizedEntryId = String(entryId || "").trim();
  if (!normalizedEntryId) return;
  localStorage.setItem(buildUserScopedKey(userId), normalizedEntryId);
};

export const clearTrackedCoalDraftEntryId = (userId = "") => {
  localStorage.removeItem(buildUserScopedKey(userId));
};

export const saveCoalDraft = async ({
  payload,
  token = "",
  userId = "",
  keepalive = false,
} = {}) => {
  const response = await fetch(
    buildRequestUrl("/api/production/save-coal-draft", userId),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(userId ? { "X-User-Id": userId } : {}),
      },
      body: JSON.stringify(cleanPayload(payload)),
      keepalive,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Draft save failed with ${response.status}`);
  }

  return response.json();
};

export const fetchCoalDraft = async ({ entryId, token = "", userId = "" } = {}) => {
  const normalizedEntryId = String(entryId || "").trim();
  if (!normalizedEntryId) return null;

  const response = await fetch(
    buildRequestUrl(
      `/api/production/get-coal-draft/${encodeURIComponent(normalizedEntryId)}`,
      userId,
    ),
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(userId ? { "X-User-Id": userId } : {}),
      },
    },
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Draft fetch failed with ${response.status}`);
  }

  return response.json();
};

export const fetchCoalDrafts = async ({ token = "", userId = "" } = {}) => {
  const response = await fetch(
    buildRequestUrl("/api/production/get-coal-drafts", userId),
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(userId ? { "X-User-Id": userId } : {}),
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Draft list fetch failed with ${response.status}`);
  }

  return response.json();
};

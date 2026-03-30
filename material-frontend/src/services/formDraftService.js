import config from "../config/config";

const buildRequestUrl = (path, params = {}) => {
  const url = new URL(`${config.apiBaseUrl}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
};

const buildHeaders = (token = "", userId = "") => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...(userId ? { "X-User-Id": userId } : {}),
});

export const saveFormDraft = async ({ payload, token = "", userId = "", keepalive = false } = {}) => {
  const response = await fetch(
    buildRequestUrl("/api/production/save-form-draft"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildHeaders(token, userId),
      },
      body: JSON.stringify(payload),
      keepalive,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Draft save failed with ${response.status}`);
  }

  return response.json();
};

export const fetchFormDrafts = async ({ moduleKey, token = "", userId = "" } = {}) => {
  const response = await fetch(
    buildRequestUrl("/api/production/get-form-drafts", { moduleKey, userId }),
    {
      headers: buildHeaders(token, userId),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Draft list fetch failed with ${response.status}`);
  }

  return response.json();
};

export const fetchFormDraft = async ({ moduleKey, entryId, token = "", userId = "" } = {}) => {
  const response = await fetch(
    buildRequestUrl("/api/production/get-form-draft", { moduleKey, entryId }),
    {
      headers: buildHeaders(token, userId),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Draft fetch failed with ${response.status}`);
  }

  return response.json();
};

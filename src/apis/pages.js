import { API_URL } from './config';

export const createPage = async (jwtToken, bodyObject) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: jwtToken,
    },
    body: JSON.stringify(bodyObject),
  };

  try {
    const response = await fetch(`${API_URL}/api/v1/brand_pages`, requestOptions);
    if (response.ok) {
      const res = await response.json();
      return res.brand_page;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message); // throw error message if not successful
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const getPages = async (jwtToken) => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: jwtToken,
    },
  };

  try {
    const response = await fetch(`${API_URL}/api/v1/brand_pages`, requestOptions);

    if (response.ok) {
      const res = await response.json();
      return res.brand_pages;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message); // throw error message if not successful
    }
  } catch (error) {
    throw new Error(error);
  }
};

// Real per-page traffic for the dashboard (page views, 14-day spark, trend).
// Returns a map keyed by the page's lookup_code:
//   { [lookup_code]: { views, views_window, trend_pct, spark } }
export const getPagesAnalytics = async (jwtToken) => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: jwtToken,
    },
  };

  const response = await fetch(`${API_URL}/api/v1/brand_pages/analytics`, requestOptions);
  if (!response.ok) {
    throw new Error('Failed to load page analytics');
  }
  const res = await response.json();
  const byLookup = {};
  for (const entry of res.pages || []) {
    byLookup[entry.lookup_code] = entry;
  }
  return byLookup;
};

// Generate (but do not persist) a page design from an AI prompt.
// `images` is an optional array of { key, url } from uploadImageToS3 (max 3).
// Returns the spec: { title, description, content, links: [...], social? }.
export const generatePage = async (jwtToken, prompt, name, images = [], template = 'links') => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: jwtToken,
    },
    body: JSON.stringify({ prompt, name, images, template }),
  };

  const response = await fetch(`${API_URL}/api/v1/brand_pages/generate`, requestOptions);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate page');
  }
  return data.page;
};

// Render template HTML (e.g. the portfolio template) from arbitrary content
// WITHOUT persisting — used for live iframe previews. Returns an HTML string.
export const renderPreview = async (jwtToken, { title, description, content }) => {
  const response = await fetch(`${API_URL}/api/v1/brand_pages/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: jwtToken },
    body: JSON.stringify({ title, description, content }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Preview failed');
  return data.html;
};

export const getPage = async (jwtToken, lookup_code) => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: jwtToken,
    },
  };

  try {
    const response = await fetch(
      `${API_URL}/api/v1/brand_pages/${lookup_code}`,
      requestOptions
    );

    if (response.ok) {
      const res = await response.json();
      return res.brand_page;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message); // throw error message if not successful
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const updatePage = async (jwtToken, lookup_code, bodyObject) => {
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: jwtToken,
    },
    body: JSON.stringify(bodyObject),
  };

  try {
    const response = await fetch(
      `${API_URL}/api/v1/brand_pages/${lookup_code}`,
      requestOptions
    );

    if (response.ok) {
      const res = await response.json();
      return res.brand_page;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const deletePage = async (jwtToken, qr_code) => {
  const requestOptions = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: jwtToken,
    },
  };

  try {
    const response = await fetch(
      `${API_URL}/api/v1/brand_pages/${qr_code}`,
      requestOptions
    );
    if (response.ok) {
      return [response, null];
    }

    if (response.status === 404) {
      return [null, 'Page not found.'];
    }

    const errorMessage = await response.json();
    return [null, `Server side error: ${errorMessage.message}`];
  } catch (error) {
    return [null, `Server down: ${error}`];
  }
};

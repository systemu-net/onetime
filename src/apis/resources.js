import { API_URL } from './config';

/**
 * Fetch all resources for a brand page
 * GET /api/v1/brand_pages/:lookup_code/resources
 */
export const getResources = async (jwtToken, lookupCode) => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwtToken
    }
  };

  try {
    const response = await fetch(`${API_URL}/api/v1/brand_pages/${lookupCode}/resources`, requestOptions);

    if (response.ok) {
      const res = await response.json();
      return res.resources;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch resources');
    }
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch resources');
  }
};

/**
 * Create a new resource (link, QR code, or image)
 * POST /api/v1/brand_pages/:lookup_code/resources
 */
export const createResource = async (jwtToken, lookupCode, payload) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwtToken
    },
    body: JSON.stringify(payload)
  };

  try {
    const response = await fetch(`${API_URL}/api/v1/brand_pages/${lookupCode}/resources`, requestOptions);
    
    if (response.ok) {
      const res = await response.json();
      return res.resource;
    }
    
    if (response.status === 422) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Validation error');
    }

    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create resource');
  } catch (error) {
    throw error;
  }
};

/**
 * Update a resource
 * PATCH /api/v1/brand_pages/:lookup_code/resources/:id
 */
export const updateResource = async (jwtToken, lookupCode, resourceId, payload) => {
  const requestOptions = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwtToken
    },
    body: JSON.stringify(payload)
  };

  try {
    const response = await fetch(`${API_URL}/api/v1/brand_pages/${lookupCode}/resources/${resourceId}`, requestOptions);
    
    if (response.ok) {
      const res = await response.json();
      return res.resource;
    }

    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update resource');
  } catch (error) {
    throw error;
  }
};

/**
 * Reorder multiple resources
 * PATCH /api/v1/brand_pages/:lookup_code/resources/reorder
 */
export const reorderResources = async (jwtToken, lookupCode, resourcesOrder) => {
  const requestOptions = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwtToken
    },
    body: JSON.stringify({ resources: resourcesOrder })
  };

  try {
    const response = await fetch(`${API_URL}/api/v1/brand_pages/${lookupCode}/resources/reorder`, requestOptions);
    
    if (response.ok) {
      const res = await response.json();
      return res.resources;
    }

    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to reorder resources');
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a resource
 * DELETE /api/v1/brand_pages/:lookup_code/resources/:id
 */
export const deleteResource = async (jwtToken, lookupCode, resourceId) => {
  const requestOptions = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwtToken
    }
  };

  try {
    const response = await fetch(`${API_URL}/api/v1/brand_pages/${lookupCode}/resources/${resourceId}`, requestOptions);
    
    if (response.ok) {
      return true; // 204 No Content
    }

    if (response.status === 404) {
      throw new Error('Resource not found');
    }

    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete resource');
  } catch (error) {
    throw error;
  }
};

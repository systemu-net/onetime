// src/apis/publish.js
import { API_URL } from './config';

/**
 * Publish a page to GitHub Pages
 * @param {string} jwtToken - JWT Authentication token
 * @param {string} lookup_code - Page lookup code to publish
 * @returns {Promise<Object>} - Publication result
 */
export const publishPage = async (jwtToken, lookup_code) => {
  try {
    const response = await fetch(`${API_URL}/api/v1/brand_pages/${lookup_code}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: jwtToken,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to publish page',
        data: null
      };
    }

    return {
      success: true,
      data: data.brand_page || data,
      error: null
    };
  } catch (error) {
    console.error('Publish page error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Unpublish a page from GitHub Pages
 * @param {string} jwtToken - JWT Authentication token
 * @param {string} lookup_code - Page lookup code to unpublish
 * @returns {Promise<Object>} - Unpublication result
 */
export const unpublishPage = async (jwtToken, lookup_code) => {
  try {
    const response = await fetch(`${API_URL}/api/v1/brand_pages/${lookup_code}/unpublish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: jwtToken,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to unpublish page',
        data: null
      };
    }

    return {
      success: true,
      data: data.brand_page || data,
      error: null
    };
  } catch (error) {
    console.error('Unpublish page error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Get publication status of a page
 * @param {string} jwtToken - JWT Authentication token
 * @param {string} lookup_code - Page lookup code to check
 * @returns {Promise<Object>} - Publication status
 */
export const getPublicationStatus = async (jwtToken, lookup_code) => {
  try {
    const response = await fetch(`${API_URL}/api/v1/brand_pages/${lookup_code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: jwtToken,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to get publication status',
        data: null
      };
    }

    return {
      success: true,
      data: data.brand_page || data,
      error: null
    };
  } catch (error) {
    console.error('Get publication status error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};
import { API_URL } from './config';

export const searchLinks = async (jwtToken, query) => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwtToken
    }
  };

  try {
    const response = await fetch(`${API_URL}/api/v1/links/search?query=${encodeURIComponent(query)}`, requestOptions);

    if (response.ok) {
      const res = await response.json();
      return res.links;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const createLink = async (jwtToken, linkData) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwtToken
    },
    body: JSON.stringify(linkData)
  };

  try {
    const response = await fetch(`${API_URL}/api/v1/links`, requestOptions);
    
    if (response.ok) {
      const res = await response.json();
      return res.link;
    }
    
    if (response.status === 422) {
      throw new Error('Invalid URL.');
    }

    const errorMessage = await response.json();
    throw new Error(errorMessage.message || 'Failed to create link');
  } catch (error) {
    throw error;
  }
};

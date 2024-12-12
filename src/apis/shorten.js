import { API_URL } from './config';

export const shortenApi = async (jwtToken, bodyObject) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwtToken
    },
    body: JSON.stringify(bodyObject)
  };
  
  try {
    const response = await fetch(`${API_URL}/api/v1/links`, requestOptions);
    if (response.ok) {
      return [response, ''];
    }

    if (response.status === 422) {
      return ['', 'Invalid URL.'];
    }

    const errorMessage = await response.json();
    return ['', `Server side error: ${errorMessage.message}`];
  } catch (error) {
    return ['', `Server down: ${error}`];
  }
}

export const getLinks = async (jwtToken) => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwtToken
    }
  };

  try {
    const response = await fetch(`${API_URL}/api/v1/links`, requestOptions);
    if (response.ok) {
      return [response, ''];
    }

    if (response.status === 401) {
      return ['', 'Invalid email or password'];
    }

    const errorMessage = await response.json();
    return ['', `Server side error: ${errorMessage.message}`];
  } catch (error) {
    return ['', `Server down: ${error}`];
  }
}

export const deleteLink = async (jwtToken, lookup_code) => {
  const requestOptions = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwtToken
    }
  };

  try {
    const response = await fetch(`${API_URL}/api/v1/links/${lookup_code}`, requestOptions);
    if (response.ok) {
      return [response, ''];
    }

    if (response.status === 404) {
      return ['', 'Link not found.'];
    }

    const errorMessage = await response.json();
    return ['', `Server side error: ${errorMessage.message}`];
  } catch (error) {
    return ['', `Server down: ${error}`];
  }
}
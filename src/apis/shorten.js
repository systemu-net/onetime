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
      const res = await response.json();
      return res.links;
    }
    else {
      const errorData = await response.json();
      throw new Error(errorData.message);  // throw error message if not successful
    }
  } catch (error) {
    throw new Error(error);
  }
}

export const getLink = async (jwtToken, lookup_code) => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwtToken
    }
  };

  try {
    const response = await fetch(`${API_URL}/api/v1/links/${lookup_code}`, requestOptions);

    if (response.ok) {
      const res = await response.json();
      return res.link;
    }
    else {
      const errorData = await response.json();
      throw new Error(errorData.message);  // throw error message if not successful
    }
  } catch (error) {
    throw new Error(error);
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
      return [response, null];
    }

    if (response.status === 404) {
      return [null, 'Link not found.'];
    }

    const errorMessage = await response.json();
    return [null, `Server side error: ${errorMessage.message}`];
  } catch (error) {
    return [null, `Server down: ${error}`];
  }
}
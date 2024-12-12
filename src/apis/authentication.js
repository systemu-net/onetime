import { API_URL } from './config';

export const registerApi = async (bodyObject) => {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyObject)
  };

  try {
    const response = await fetch(`${API_URL}/users`, requestOptions);
    if (response.ok) {
      return [response, ''];
    }

    if (response.status === 422) {
      return ['', 'User already exists.'];
    }

    const errorMessage = await response.json();
    return ['', `Server side error: ${errorMessage.message}`];
  } catch (error) {
    return ['', `Server down: ${error}`];
  }  
}

export const loginApi = async (bodyObject) => {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyObject)
  };
  
  try {
    const response = await fetch(`${API_URL}/users/sign_in`, requestOptions);
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

export const logoutApi = async (jwtToken) => {
  const requestOptions = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwtToken
    }
  };
  
  try {
    const response = await fetch(`${API_URL}/users/sign_out`, requestOptions);
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

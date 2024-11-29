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
      const data = await response.json();
      return [data, ''];
    }

    const errorMessage = await response.text();
    return ['', `Server side error: ${errorMessage}`];
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
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
      const data = await response.json();
      return [data, ''];
    }

    const errorMessage = await response.text();
    return ['', `Server side error: ${errorMessage}`];
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
    return ['', `Server down: ${error}`];
  }  
}

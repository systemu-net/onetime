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

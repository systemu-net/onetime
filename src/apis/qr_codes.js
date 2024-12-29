import { API_URL } from './config';

export const createQrCode = async (jwtToken, bodyObject) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: jwtToken,
    },
    body: JSON.stringify(bodyObject),
  };

  try {
    const response = await fetch(`${API_URL}/api/v1/qr_codes`, requestOptions);
    if (response.ok) {
      return response.json();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message); // throw error message if not successful
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const getQrCodes = async (jwtToken) => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: jwtToken,
    },
  };

  try {
    const response = await fetch(`${API_URL}/api/v1/qr_codes`, requestOptions);

    if (response.ok) {
      const res = await response.json();
      return res.qr_codes;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message); // throw error message if not successful
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const getQrCode = async (jwtToken, qr_code) => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: jwtToken,
    },
  };

  try {
    const response = await fetch(
      `${API_URL}/api/v1/qr_codes/${qr_code}`,
      requestOptions
    );

    if (response.ok) {
      const res = await response.json();
      return res.qr_code;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message); // throw error message if not successful
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteQrCode = async (jwtToken, qr_code) => {
  const requestOptions = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: jwtToken,
    },
  };

  try {
    const response = await fetch(
      `${API_URL}/api/v1/qr_codes/${qr_code}`,
      requestOptions
    );
    if (response.ok) {
      return [response, null];
    }

    if (response.status === 404) {
      return [null, 'QrCode not found.'];
    }

    const errorMessage = await response.json();
    return [null, `Server side error: ${errorMessage.message}`];
  } catch (error) {
    return [null, `Server down: ${error}`];
  }
};

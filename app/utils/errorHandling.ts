import Config from 'react-native-config';

// Custom error class for errors from Strapi API
class APIResponseError extends Error {
  constructor(response: Response) {
    super(`API Error Response: ${response.status} ${response.statusText}`);
  }
}

// Checking the status
export const checkStatus = (response: Response) => {
  if (response.ok) {
    // response.status >= 200 && response.status < 300
    return response;
  } else {
    throw new APIResponseError(response);
  }
};

class MissingEnvironmentVariable extends Error {
  constructor(name: string) {
    super(
      `Missing Environment Variable: The ${name} environment variable must be defined`,
    );
  }
}

export const checkEnvVars = () => {
  const envVars = ['STRAPI_URL_BASE', 'STRAPI_API_TOKEN'];

  for (const envVar of envVars) {
    if (!Config[envVar]) {
      throw new MissingEnvironmentVariable(envVar);
    }
  }
};

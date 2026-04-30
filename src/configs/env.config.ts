const ENV = {
  API_URL: import.meta.env.VITE_API_URL,
  COOKIE: {
    ACCESS_TOKEN_NAME: import.meta.env.VITE_ACCESS_TOKEN_NAME ?? '',
    REFRESH_TOKEN_NAME: import.meta.env.VITE_REFRESH_TOKEN_NAME ?? '',
  },
  S3_URL: import.meta.env.VITE_S3_URL,
};

export default ENV;

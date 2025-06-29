export const API_CONFIG = {
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-api.com' 
    : 'http://localhost:8080', // 开发环境默认Spring Boot端口
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};
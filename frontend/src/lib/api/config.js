// 客户端和服务器端使用不同的 API 配置
const getBaseURL = () => {
  // 在浏览器环境中
  if (typeof window !== 'undefined') {
    return process.env.NODE_ENV === 'production' 
      ? '/api'  // 生产环境使用相对路径，通过 Nginx 代理
      : 'http://localhost:8080';
  }
  // 在服务器端渲染环境中
  return process.env.API_BASE_URL || 'http://localhost:8080';
};

export const API_CONFIG = {
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};

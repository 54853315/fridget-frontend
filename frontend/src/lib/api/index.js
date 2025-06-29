import axios from "axios";
import { API_CONFIG } from "./config";

const api = axios.create(API_CONFIG);

let accessToken = null;
let refreshToken = null;

// 设置Token
export const setTokens = (access, refresh) => {
  accessToken = access;
  refreshToken = refresh;
  // access&refresh均同步填充cookie，供node(svelteKitServer)读取
  if (access) {
    localStorage.setItem("accessToken", access);
    document.cookie = `accessToken=${access}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }
  if (refresh) {
    localStorage.setItem("refreshToken", refresh);
    document.cookie = `refreshToken=${refresh}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }
};

// 获取Token
export const getTokens = () => {
  if (!accessToken) {
    accessToken = localStorage.getItem("accessToken");
  }
  if (!refreshToken) {
    refreshToken = localStorage.getItem("refreshToken");
  }
  return { accessToken, refreshToken };
};

// 清除Token
export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  // 同时清除cookies
  document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

// 请求拦截器
api.interceptors.request.use(
  config => {
    const { accessToken } = getTokens();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    if (error.response?.status === 401) {
      // Token过期，清除本地存储
      clearTokens();
      // 可以在这里触发重新登录
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// 封装常用方法
export const ApiService = {
  get: (url, params) => api.get(url, { params }),
  post: (url, data) => api.post(url, data),
  put: (url, data) => api.put(url, data),
  delete: (url, data) => api.delete(url, { data }),
};

// 用户管理API
export const UserApi = {
  // 获取所有用户 (需要ADMIN权限)
  getAllUsers: () => ApiService.get("/users"),

  // 用户注册
  register: userData => ApiService.post("/user/create", userData),

  // 用户登录
  login: credentials => ApiService.post("/doLogin", credentials),

  // 用户登出
  logout: token => ApiService.post("/doLogout", { token }),
};

// 食材管理API
export const IngredientApi = {
  // 获取我的食材
  getMyIngredients: () => ApiService.get("/user/ingredients"),

  // 添加食材
  addIngredients: ingredients => ApiService.post("/user/ingredients/create", ingredients),

  // 删除食材
  deleteIngredients: ingredients => ApiService.delete("/user/ingredients/delete", ingredients),
};

// 食谱推荐API
export const RecipeApi = {
  /**
   * 获取推荐食谱
   * @returns {Promise<Any[]>} 一个包含推荐食谱对象的数组
   */
  getRecommendedRecipes: () => ApiService.get("/recipe/recommend"),
};

// 烹饪偏好管理API
export const CookingPreferenceApi = {
  // 获取用户烹饪偏好
  getCookingPreference: () => ApiService.get("/user/cooking-preference"),

  // 创建或更新用户烹饪偏好
  saveCookingPreference: preferenceData => ApiService.post("/user/cooking-preference", preferenceData),

  // 删除用户烹饪偏好
  deleteCookingPreference: () => ApiService.delete("/user/cooking-preference"),
};

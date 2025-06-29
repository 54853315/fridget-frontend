import { redirect } from "@sveltejs/kit";
import { API_CONFIG } from "$lib/api/config";

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies, fetch }) {
  const accessToken = cookies.get("accessToken");

  if (!accessToken) {
    throw redirect(302, "/login");
  }

  try {
    // 使用一个需要认证的轻量接口来验证token有效性
    const response = await fetch(`${API_CONFIG.baseURL}/user/ingredients`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // token 无效，清除 cookie 并重定向
      throw redirect(302, "/login");
    }

    return {
      user: { authenticated: true },
    };
  } catch (error) {
    throw redirect(302, "/login");
  }
}

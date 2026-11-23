import {createSlice, PayloadAction} from "@reduxjs/toolkit";

/**
 * 用户安全状态接口
 *
 * 【Token 零暴露架构 ✅ 已完成】
 * - ✅ refreshToken: 已永久过滤，永不存储在 Redux
 * - ✅ accessToken: 已彻底从客户端移除，由服务端 API 代理透明处理
 * - 仅保留 UI 渲染必需的用户基本信息
 *
 * 【安全设计原则】
 * - 显式字段提取：禁止 ... 扩散对象，确保不意外存储敏感数据
 * - 单一数据源：认证状态完全由 NextAuth Session 管理，不重复存储
 */
interface SafeUserState {
  userId?: number;
  nickname?: string;
  avatar?: string;
  email?: string;
  expiresTime?: number;
  error?: "RefreshTokenError";
  // ❌ 已永久过滤: refreshToken（永不存储在 Redux）
  // ⚠️ accessToken: 不存储在 Redux，由 NextAuth 直接管理
}

interface UserState {
  user: SafeUserState | null;
    isAuthenticated: boolean;
  isSessionLoading: boolean;  // NextAuth session 是否正在加载中
}

const initialState: UserState = {
    user: null,
    isAuthenticated: false,
  isSessionLoading: true,  // 初始化为 true，避免页面加载时闪烁
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
      setUser: (state, action: PayloadAction<SafeUserState>) => {
        // 安全过滤：确保不存储任何敏感 Token 信息
        const {userId, nickname, avatar, email, expiresTime, error} = action.payload;
        state.user = {userId, nickname, avatar, email, expiresTime, error};
            state.isAuthenticated = true;
        },
        clearUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
      setSessionLoading: (state, action: PayloadAction<boolean>) => {
        state.isSessionLoading = action.payload;
      },
    },
});

export const {setUser, clearUser, setSessionLoading} = userSlice.actions;
export default userSlice.reducer;

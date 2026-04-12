export interface OAuth2Token {
  userId: number;
  accessToken: string;
  refreshToken: string;
  expiresTime?: string;
  openid?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
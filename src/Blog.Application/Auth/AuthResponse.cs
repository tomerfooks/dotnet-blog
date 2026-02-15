namespace Blog.Application.Auth;

public sealed record AuthResponse(string AccessToken, string RefreshToken, DateTime ExpiresAtUtc);

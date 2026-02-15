namespace Blog.Application.Auth;

public sealed record SignupRequest(string Email, string Password, string? Role);

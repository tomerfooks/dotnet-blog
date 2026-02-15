namespace Blog.Api.Contracts.Responses;

public sealed record UserResponse(
    Guid Id,
    string Email,
    string Role,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc);

namespace Blog.Api.Contracts.Responses;

public sealed record CategoryResponse(
    Guid Id,
    string Name,
    string Slug,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc);

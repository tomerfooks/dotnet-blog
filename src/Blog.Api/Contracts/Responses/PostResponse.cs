namespace Blog.Api.Contracts.Responses;

public sealed record PostResponse(
    Guid Id,
    string Title,
    string Slug,
    string Content,
    string Status,
    DateTime? PublishedAtUtc,
    PostAuthorSummary? Author,
    PostCategorySummary? Category,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc);

public sealed record PostAuthorSummary(Guid Id, string Email, string Role);

public sealed record PostCategorySummary(Guid Id, string Name, string Slug);

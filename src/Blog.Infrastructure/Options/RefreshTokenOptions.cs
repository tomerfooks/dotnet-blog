namespace Blog.Infrastructure.Options;

public sealed class RefreshTokenOptions
{
    public const string SectionName = "RefreshTokens";

    public int ExpirationDays { get; init; } = 14;
}

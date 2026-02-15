namespace Blog.Infrastructure.Options;

public sealed class RedisOptions
{
    public const string SectionName = "Redis";

    public string ConnectionString { get; init; } = "redis:6379";
    public string KeyPrefix { get; init; } = "v1";
}

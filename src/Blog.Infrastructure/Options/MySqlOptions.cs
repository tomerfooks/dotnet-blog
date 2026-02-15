namespace Blog.Infrastructure.Options;

public sealed class MySqlOptions
{
    public const string SectionName = "MySql";

    public string ConnectionString { get; init; } = string.Empty;
}

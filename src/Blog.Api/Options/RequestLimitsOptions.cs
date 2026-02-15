namespace Blog.Api.Options;

public sealed class RequestLimitsOptions
{
    public const string SectionName = "RequestLimits";

    public long MaxRequestBodySizeBytes { get; init; } = 1_048_576;
}

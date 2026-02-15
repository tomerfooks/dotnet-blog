using System.ComponentModel.DataAnnotations;

namespace Blog.Api.Contracts.Posts;

public sealed class UpdatePostRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; init; } = string.Empty;

    [Required]
    [MaxLength(240)]
    public string Slug { get; init; } = string.Empty;

    [Required]
    public string Content { get; init; } = string.Empty;

    [Required]
    public Guid CategoryId { get; init; }

    public bool Publish { get; init; }
}

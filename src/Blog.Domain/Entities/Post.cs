using Blog.Domain.Common;
using Blog.Domain.Enums;

namespace Blog.Domain.Entities;

public class Post : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public PostStatus Status { get; set; } = PostStatus.Draft;
    public DateTime? PublishedAtUtc { get; set; }

    public Guid AuthorId { get; set; }
    public User? Author { get; set; }

    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }

    public void Publish(DateTime nowUtc)
    {
        Status = PostStatus.Published;
        PublishedAtUtc ??= nowUtc;
        UpdatedAtUtc = nowUtc;
    }

    public void Unpublish(DateTime nowUtc)
    {
        Status = PostStatus.Draft;
        PublishedAtUtc = null;
        UpdatedAtUtc = nowUtc;
    }
}

using Blog.Domain.Entities;
using Blog.Domain.Enums;

namespace Blog.Domain.Tests;

public sealed class PostDomainTests
{
    [Fact]
    public void Publish_SetsStatusAndPublishedAt()
    {
        var post = new Post
        {
            Title = "Draft",
            Slug = "draft",
            Content = "content",
            Status = PostStatus.Draft
        };

        var now = DateTime.UtcNow;
        post.Publish(now);

        Assert.Equal(PostStatus.Published, post.Status);
        Assert.Equal(now, post.PublishedAtUtc);
        Assert.Equal(now, post.UpdatedAtUtc);
    }

    [Fact]
    public void Unpublish_SetsDraftAndClearsPublishedAt()
    {
        var post = new Post
        {
            Title = "Published",
            Slug = "published",
            Content = "content",
            Status = PostStatus.Published,
            PublishedAtUtc = DateTime.UtcNow.AddDays(-1)
        };

        var now = DateTime.UtcNow;
        post.Unpublish(now);

        Assert.Equal(PostStatus.Draft, post.Status);
        Assert.Null(post.PublishedAtUtc);
        Assert.Equal(now, post.UpdatedAtUtc);
    }
}

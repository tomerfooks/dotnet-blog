using Blog.Domain.Entities;
using Blog.Domain.Enums;
using Blog.Domain.Repositories;
using Blog.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Blog.Infrastructure.Repositories;

public sealed class PostRepository(BlogDbContext dbContext) : IPostRepository
{
    public async Task<Post?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Posts
            .Include(x => x.Category)
            .Include(x => x.Author)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<Post?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await dbContext.Posts
            .Include(x => x.Category)
            .Include(x => x.Author)
            .FirstOrDefaultAsync(x => x.Slug == slug, cancellationToken);
    }

    public async Task<IReadOnlyList<Post>> GetPublishedAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Posts
            .Where(x => x.Status == PostStatus.Published)
            .OrderByDescending(x => x.PublishedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Post post, CancellationToken cancellationToken = default)
    {
        await dbContext.Posts.AddAsync(post, cancellationToken);
    }

    public Task DeleteAsync(Post post, CancellationToken cancellationToken = default)
    {
        dbContext.Posts.Remove(post);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}

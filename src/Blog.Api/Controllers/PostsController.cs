using Asp.Versioning;
using Blog.Api.Contracts.Posts;
using Blog.Api.Contracts.Responses;
using Blog.Domain.Entities;
using Blog.Domain.Enums;
using Blog.Domain.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;

namespace Blog.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/posts")]
public sealed class PostsController(IPostRepository postRepository, IOutputCacheStore outputCacheStore) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    [OutputCache(Duration = 60, Tags = ["posts"])]
    public async Task<ActionResult<IReadOnlyList<PostResponse>>> GetPublished(CancellationToken cancellationToken)
    {
        var posts = await postRepository.GetPublishedAsync(cancellationToken);
        return Ok(posts.Select(Map));
    }

    [AllowAnonymous]
    [HttpGet("{slug}")]
    [OutputCache(Duration = 300, Tags = ["posts"])]
    public async Task<ActionResult<PostResponse>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var post = await postRepository.GetBySlugAsync(slug, cancellationToken);
        if (post is null)
        {
            return NotFound();
        }

        return Ok(Map(post));
    }

    [Authorize(Policy = "EditorOrAdmin")]
    [HttpPost]
    public async Task<ActionResult<PostResponse>> Create([FromBody] CreatePostRequest request, CancellationToken cancellationToken)
    {
        var post = new Post
        {
            Title = request.Title.Trim(),
            Slug = request.Slug.Trim().ToLowerInvariant(),
            Content = request.Content,
            AuthorId = request.AuthorId,
            CategoryId = request.CategoryId,
            Status = request.Publish ? PostStatus.Published : PostStatus.Draft,
            PublishedAtUtc = request.Publish ? DateTime.UtcNow : null
        };

        await postRepository.AddAsync(post, cancellationToken);
        await postRepository.SaveChangesAsync(cancellationToken);
        await outputCacheStore.EvictByTagAsync("posts", cancellationToken);

        return CreatedAtAction(nameof(GetBySlug), new { slug = post.Slug, version = "1" }, Map(post));
    }

    [Authorize(Policy = "EditorOrAdmin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PostResponse>> Update(Guid id, [FromBody] UpdatePostRequest request, CancellationToken cancellationToken)
    {
        var post = await postRepository.GetByIdAsync(id, cancellationToken);
        if (post is null)
        {
            return NotFound();
        }

        post.Title = request.Title.Trim();
        post.Slug = request.Slug.Trim().ToLowerInvariant();
        post.Content = request.Content;
        post.CategoryId = request.CategoryId;
        post.Status = request.Publish ? PostStatus.Published : PostStatus.Draft;
        post.PublishedAtUtc = request.Publish ? (post.PublishedAtUtc ?? DateTime.UtcNow) : null;
        post.UpdatedAtUtc = DateTime.UtcNow;

        await postRepository.SaveChangesAsync(cancellationToken);
        await outputCacheStore.EvictByTagAsync("posts", cancellationToken);

        return Ok(Map(post));
    }

    [Authorize(Policy = "EditorOrAdmin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var post = await postRepository.GetByIdAsync(id, cancellationToken);
        if (post is null)
        {
            return NotFound();
        }

        await postRepository.DeleteAsync(post, cancellationToken);
        await postRepository.SaveChangesAsync(cancellationToken);
        await outputCacheStore.EvictByTagAsync("posts", cancellationToken);

        return NoContent();
    }

    private static PostResponse Map(Post post)
    {
        return new PostResponse(
            post.Id,
            post.Title,
            post.Slug,
            post.Content,
            post.Status.ToString(),
            post.PublishedAtUtc,
            post.Author is null ? null : new PostAuthorSummary(post.Author.Id, post.Author.Email, post.Author.Role.ToString()),
            post.Category is null ? null : new PostCategorySummary(post.Category.Id, post.Category.Name, post.Category.Slug),
            post.CreatedAtUtc,
            post.UpdatedAtUtc);
    }
}

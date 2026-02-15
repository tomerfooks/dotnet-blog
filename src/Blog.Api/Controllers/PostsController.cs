using Asp.Versioning;
using Blog.Api.Contracts.Posts;
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
    public async Task<ActionResult<IReadOnlyList<Post>>> GetPublished(CancellationToken cancellationToken)
    {
        var posts = await postRepository.GetPublishedAsync(cancellationToken);
        return Ok(posts);
    }

    [AllowAnonymous]
    [HttpGet("{slug}")]
    [OutputCache(Duration = 300, Tags = ["posts"])]
    public async Task<ActionResult<Post>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var post = await postRepository.GetBySlugAsync(slug, cancellationToken);
        if (post is null)
        {
            return NotFound();
        }

        return Ok(post);
    }

    [Authorize(Policy = "EditorOrAdmin")]
    [HttpPost]
    public async Task<ActionResult<Post>> Create([FromBody] CreatePostRequest request, CancellationToken cancellationToken)
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

        return CreatedAtAction(nameof(GetBySlug), new { slug = post.Slug, version = "1" }, post);
    }

    [Authorize(Policy = "EditorOrAdmin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Post>> Update(Guid id, [FromBody] UpdatePostRequest request, CancellationToken cancellationToken)
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

        return Ok(post);
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
}

using Asp.Versioning;
using Blog.Api.Contracts.Categories;
using Blog.Api.Contracts.Responses;
using Blog.Domain.Entities;
using Blog.Domain.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;

namespace Blog.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/categories")]
public sealed class CategoriesController(ICategoryRepository categoryRepository, IOutputCacheStore outputCacheStore) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    [OutputCache(Duration = 60, Tags = ["categories"])]
    public async Task<ActionResult<IReadOnlyList<CategoryResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var categories = await categoryRepository.GetAllAsync(cancellationToken);
        return Ok(categories.Select(Map));
    }

    [AllowAnonymous]
    [HttpGet("{slug}")]
    [OutputCache(Duration = 300, Tags = ["categories"])]
    public async Task<ActionResult<CategoryResponse>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var category = await categoryRepository.GetBySlugAsync(slug, cancellationToken);
        if (category is null)
        {
            return NotFound();
        }

        return Ok(Map(category));
    }

    [Authorize(Policy = "EditorOrAdmin")]
    [HttpPost]
    public async Task<ActionResult<CategoryResponse>> Create([FromBody] CreateCategoryRequest request, CancellationToken cancellationToken)
    {
        var category = new Category
        {
            Name = request.Name.Trim(),
            Slug = request.Slug.Trim().ToLowerInvariant()
        };

        await categoryRepository.AddAsync(category, cancellationToken);
        await categoryRepository.SaveChangesAsync(cancellationToken);
        await outputCacheStore.EvictByTagAsync("categories", cancellationToken);

        return CreatedAtAction(nameof(GetBySlug), new { slug = category.Slug, version = "1" }, Map(category));
    }

    [Authorize(Policy = "EditorOrAdmin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CategoryResponse>> Update(Guid id, [FromBody] UpdateCategoryRequest request, CancellationToken cancellationToken)
    {
        var category = await categoryRepository.GetByIdAsync(id, cancellationToken);
        if (category is null)
        {
            return NotFound();
        }

        category.Name = request.Name.Trim();
        category.Slug = request.Slug.Trim().ToLowerInvariant();
        category.UpdatedAtUtc = DateTime.UtcNow;

        await categoryRepository.SaveChangesAsync(cancellationToken);
        await outputCacheStore.EvictByTagAsync("categories", cancellationToken);

        return Ok(Map(category));
    }

    [Authorize(Policy = "EditorOrAdmin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var category = await categoryRepository.GetByIdAsync(id, cancellationToken);
        if (category is null)
        {
            return NotFound();
        }

        await categoryRepository.DeleteAsync(category, cancellationToken);
        await categoryRepository.SaveChangesAsync(cancellationToken);
        await outputCacheStore.EvictByTagAsync("categories", cancellationToken);

        return NoContent();
    }

    private static CategoryResponse Map(Category category)
    {
        return new CategoryResponse(category.Id, category.Name, category.Slug, category.CreatedAtUtc, category.UpdatedAtUtc);
    }
}

using System.ComponentModel.DataAnnotations;

namespace Blog.Api.Contracts.Categories;

public sealed class CreateCategoryRequest
{
    [Required]
    [MaxLength(120)]
    public string Name { get; init; } = string.Empty;

    [Required]
    [MaxLength(160)]
    public string Slug { get; init; } = string.Empty;
}

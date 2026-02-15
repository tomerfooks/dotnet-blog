using Asp.Versioning;
using Blog.Api.Contracts.Users;
using Blog.Domain.Enums;
using Blog.Domain.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Blog.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/users")]
[Authorize(Policy = "AdminOnly")]
public sealed class UsersController(IUserRepository userRepository) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var users = await userRepository.GetAllAsync(cancellationToken);
        return Ok(users.Select(x => new { x.Id, x.Email, Role = x.Role.ToString(), x.CreatedAtUtc, x.UpdatedAtUtc }));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        return Ok(new { user.Id, user.Email, Role = user.Role.ToString(), user.CreatedAtUtc, user.UpdatedAtUtc });
    }

    [HttpPatch("{id:guid}/role")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateUserRoleRequest request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        var parsedRole = request.Role?.Trim().ToLowerInvariant() switch
        {
            "admin" => UserRole.Admin,
            "editor" => UserRole.Editor,
            "guest" => UserRole.Guest,
            _ => (UserRole?)null
        };

        if (parsedRole is null)
        {
            return BadRequest(new { message = "Invalid role. Allowed: guest, editor, admin." });
        }

        user.Role = parsedRole.Value;
        user.UpdatedAtUtc = DateTime.UtcNow;
        await userRepository.SaveChangesAsync(cancellationToken);

        return Ok(new { user.Id, user.Email, Role = user.Role.ToString(), user.CreatedAtUtc, user.UpdatedAtUtc });
    }
}

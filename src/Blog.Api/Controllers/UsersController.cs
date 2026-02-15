using Asp.Versioning;
using Blog.Api.Contracts.Responses;
using Blog.Application.Auth;
using Blog.Api.Contracts.Users;
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
        return Ok(users.Select(Map));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        return Ok(Map(user));
    }

    [HttpPatch("{id:guid}/role")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateUserRoleRequest request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        if (!UserRoleInput.TryParseRequired(request.Role, out var parsedRole))
        {
            return BadRequest(new { message = "Invalid role. Allowed: guest, editor, admin." });
        }

        user.Role = parsedRole;
        user.UpdatedAtUtc = DateTime.UtcNow;
        await userRepository.SaveChangesAsync(cancellationToken);

        return Ok(Map(user));
    }

    private static UserResponse Map(Blog.Domain.Entities.User user)
    {
        return new UserResponse(user.Id, user.Email, user.Role.ToString(), user.CreatedAtUtc, user.UpdatedAtUtc);
    }
}

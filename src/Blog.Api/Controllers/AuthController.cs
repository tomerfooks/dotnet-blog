using Asp.Versioning;
using Blog.Application.Abstractions;
using Blog.Application.Auth;
using Blog.Domain.Entities;
using Blog.Domain.Enums;
using Blog.Domain.Repositories;
using Blog.Infrastructure.Options;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Blog.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/auth")]
public sealed class AuthController(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenService jwtTokenService,
    IRefreshTokenStore refreshTokenStore,
    IValidator<SignupRequest> signupValidator,
    IValidator<SigninRequest> signinValidator,
    IValidator<RefreshRequest> refreshValidator,
    IOptions<JwtOptions> jwtOptions) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("signup")]
    public async Task<ActionResult<AuthResponse>> Signup([FromBody] SignupRequest request, CancellationToken cancellationToken)
    {
        var validation = await signupValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(new ValidationProblemDetails(validation.ToDictionary()));
        }

        var existingUser = await userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingUser is not null)
        {
            return Conflict(new { message = "Email is already registered." });
        }

        var role = request.Role?.ToLowerInvariant() switch
        {
            "admin" => UserRole.Admin,
            "editor" => UserRole.Editor,
            _ => UserRole.Guest
        };

        var user = new User
        {
            Email = request.Email.Trim().ToLowerInvariant(),
            PasswordHash = passwordHasher.HashPassword(request.Password),
            Role = role
        };

        await userRepository.AddAsync(user, cancellationToken);
        await userRepository.SaveChangesAsync(cancellationToken);

        var accessToken = jwtTokenService.GenerateAccessToken(user);
        var refreshToken = await refreshTokenStore.CreateAsync(user.Id, cancellationToken);
        var response = new AuthResponse(accessToken, refreshToken, DateTime.UtcNow.AddMinutes(jwtOptions.Value.AccessTokenMinutes));

        return Ok(response);
    }

    [AllowAnonymous]
    [HttpPost("signin")]
    public async Task<ActionResult<AuthResponse>> Signin([FromBody] SigninRequest request, CancellationToken cancellationToken)
    {
        var validation = await signinValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(new ValidationProblemDetails(validation.ToDictionary()));
        }

        var user = await userRepository.GetByEmailAsync(request.Email.Trim().ToLowerInvariant(), cancellationToken);
        if (user is null || !passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var accessToken = jwtTokenService.GenerateAccessToken(user);
        var refreshToken = await refreshTokenStore.CreateAsync(user.Id, cancellationToken);

        return Ok(new AuthResponse(accessToken, refreshToken, DateTime.UtcNow.AddMinutes(jwtOptions.Value.AccessTokenMinutes)));
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh([FromBody] RefreshRequest request, CancellationToken cancellationToken)
    {
        var validation = await refreshValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(new ValidationProblemDetails(validation.ToDictionary()));
        }

        var userId = await refreshTokenStore.ValidateAndRotateAsync(request.RefreshToken, cancellationToken);
        if (userId is null)
        {
            return Unauthorized(new { message = "Invalid refresh token." });
        }

        var user = await userRepository.GetByIdAsync(userId.Value, cancellationToken);
        if (user is null)
        {
            return Unauthorized(new { message = "User not found." });
        }

        var accessToken = jwtTokenService.GenerateAccessToken(user);
        var refreshToken = await refreshTokenStore.CreateAsync(user.Id, cancellationToken);

        return Ok(new AuthResponse(accessToken, refreshToken, DateTime.UtcNow.AddMinutes(jwtOptions.Value.AccessTokenMinutes)));
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshRequest request, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            await refreshTokenStore.RevokeAsync(request.RefreshToken, cancellationToken);
        }

        return NoContent();
    }
}

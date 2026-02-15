namespace Blog.Application.Abstractions;

public interface IRefreshTokenStore
{
    Task<string> CreateAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Guid?> ValidateAndRotateAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task RevokeAsync(string refreshToken, CancellationToken cancellationToken = default);
}

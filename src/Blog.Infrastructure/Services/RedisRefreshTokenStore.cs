using System.Security.Cryptography;
using Blog.Application.Abstractions;
using Blog.Infrastructure.Options;
using Microsoft.Extensions.Options;
using StackExchange.Redis;

namespace Blog.Infrastructure.Services;

public sealed class RedisRefreshTokenStore(
    IConnectionMultiplexer redis,
    IOptions<RedisOptions> redisOptions,
    IOptions<RefreshTokenOptions> refreshTokenOptions) : IRefreshTokenStore
{
    private readonly IDatabase _database = redis.GetDatabase();
    private readonly RedisOptions _redisOptions = redisOptions.Value;
    private readonly RefreshTokenOptions _refreshTokenOptions = refreshTokenOptions.Value;

    public async Task<string> CreateAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(48));
        var key = BuildKey(token);
        await _database.StringSetAsync(key, userId.ToString(), TimeSpan.FromDays(_refreshTokenOptions.ExpirationDays));
        return token;
    }

    public async Task<Guid?> ValidateAndRotateAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var key = BuildKey(refreshToken);
        var value = await _database.StringGetAsync(key);
        if (value.IsNullOrEmpty)
        {
            return null;
        }

        await _database.KeyDeleteAsync(key);

        if (!Guid.TryParse(value, out var userId))
        {
            return null;
        }

        return userId;
    }

    public async Task RevokeAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        await _database.KeyDeleteAsync(BuildKey(refreshToken));
    }

    private string BuildKey(string token)
    {
        return $"{_redisOptions.KeyPrefix}:refresh:{token}";
    }
}

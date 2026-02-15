using Blog.Domain.Entities;

namespace Blog.Application.Abstractions;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user);
}

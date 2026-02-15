using Blog.Domain.Enums;

namespace Blog.Application.Auth;

public static class UserRoleInput
{
    public static bool TryParse(string? input, out UserRole role)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            role = UserRole.Guest;
            return true;
        }

        role = input.Trim().ToLowerInvariant() switch
        {
            "admin" => UserRole.Admin,
            "editor" => UserRole.Editor,
            "guest" => UserRole.Guest,
            _ => UserRole.Guest
        };

        return input.Trim().ToLowerInvariant() is "admin" or "editor" or "guest";
    }

    public static bool TryParseRequired(string? input, out UserRole role)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            role = default;
            return false;
        }

        return TryParse(input, out role);
    }
}

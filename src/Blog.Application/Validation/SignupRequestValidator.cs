using Blog.Application.Auth;
using FluentValidation;

namespace Blog.Application.Validation;

public sealed class SignupRequestValidator : AbstractValidator<SignupRequest>
{
    public SignupRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .MaximumLength(128);

        RuleFor(x => x.Role)
            .Must(static role => UserRoleInput.TryParse(role, out _))
            .WithMessage("Role must be one of: guest, editor, admin.");
    }
}

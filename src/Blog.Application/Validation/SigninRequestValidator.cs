using Blog.Application.Auth;
using FluentValidation;

namespace Blog.Application.Validation;

public sealed class SigninRequestValidator : AbstractValidator<SigninRequest>
{
    public SigninRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .MaximumLength(128);
    }
}

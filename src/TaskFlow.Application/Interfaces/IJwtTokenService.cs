using TaskFlow.Domain.Entities;

namespace TaskFlow.Application.Interfaces;

/// <summary>
/// JWT Token Service interface — defined in Application layer,
/// implemented in Infrastructure layer (Clean Architecture: inner layers don't know outer layers).
/// </summary>
public interface IJwtTokenService
{
    string GenerateToken(User user);
}

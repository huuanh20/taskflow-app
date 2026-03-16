using TaskFlow.Application.DTOs.Auth;

namespace TaskFlow.Application.Interfaces;

public interface IUserService
{
    Task<UserDto?> GetByIdAsync(int id);
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<UserDto> UpdateProfileAsync(int userId, string fullName, string email);
    Task UpdateRoleAsync(int userId, string role);
}

using AutoMapper;
using TaskFlow.Application.DTOs.Auth;
using TaskFlow.Application.Interfaces;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.Services;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UserService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await _unitOfWork.Users.GetAllAsync();
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<UserDto> UpdateProfileAsync(int userId, string fullName, string email)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        user.FullName = fullName;
        user.Email = email;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<UserDto>(user);
    }

    public async Task UpdateRoleAsync(int userId, string role)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        user.Role = role;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync();
    }
}

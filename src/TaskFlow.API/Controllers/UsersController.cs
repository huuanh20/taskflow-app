using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.Application.DTOs.Auth;
using TaskFlow.Application.Interfaces;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// GET /api/users/me — Get current user profile
    /// </summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var user = await _userService.GetByIdAsync(GetUserId());
        if (user == null) return NotFound();
        return Ok(user);
    }

    /// <summary>
    /// GET /api/users — Get all users (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userService.GetAllAsync();
        return Ok(users);
    }

    /// <summary>
    /// PUT /api/users/{id}/role — Change user role (Admin only)
    /// </summary>
    [HttpPut("{id}/role")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleDto dto)
    {
        try
        {
            await _userService.UpdateRoleAsync(id, dto.Role);
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(new { message = "User not found." }); }
    }
}

public class UpdateRoleDto
{
    public string Role { get; set; } = string.Empty;
}

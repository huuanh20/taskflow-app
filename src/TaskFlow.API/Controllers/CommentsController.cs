using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.Application.DTOs.Comments;
using TaskFlow.Application.Interfaces;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/tasks/{taskItemId}/[controller]")]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;

    public CommentsController(ICommentService commentService)
    {
        _commentService = commentService;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> Create(int taskItemId, [FromBody] CreateCommentDto dto)
    {
        try
        {
            var result = await _commentService.CreateAsync(taskItemId, GetUserId(), dto);
            return StatusCode(201, result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpGet]
    public async Task<IActionResult> GetByTask(int taskItemId)
    {
        var comments = await _commentService.GetByTaskAsync(taskItemId);
        return Ok(comments);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int taskItemId, int id)
    {
        try
        {
            await _commentService.DeleteAsync(id, GetUserId());
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }
}

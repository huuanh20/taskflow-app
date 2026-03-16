using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.Application.DTOs.Tasks;
using TaskFlow.Application.Interfaces;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/projects/{projectId}/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// POST /api/projects/{projectId}/tasks — Create a task in project
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create(int projectId, [FromBody] CreateTaskDto dto)
    {
        try
        {
            var result = await _taskService.CreateAsync(projectId, dto);
            return StatusCode(201, result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// GET /api/projects/{projectId}/tasks — Get filtered, sorted, paginated tasks
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetTasks(int projectId, [FromQuery] TaskFilterDto filter)
    {
        var result = await _taskService.GetFilteredAsync(projectId, filter);
        return Ok(result);
    }

    /// <summary>
    /// GET /api/projects/{projectId}/tasks/{id} — Get task details
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int projectId, int id)
    {
        var task = await _taskService.GetByIdAsync(id);
        if (task == null) return NotFound(new { message = "Task not found." });
        return Ok(task);
    }

    /// <summary>
    /// PUT /api/projects/{projectId}/tasks/{id} — Update task info
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int projectId, int id, [FromBody] UpdateTaskDto dto)
    {
        try
        {
            var result = await _taskService.UpdateAsync(id, GetUserId(), dto);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(new { message = "Task not found." }); }
    }

    /// <summary>
    /// PATCH /api/projects/{projectId}/tasks/{id}/status — Update task status
    /// </summary>
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int projectId, int id, [FromBody] UpdateTaskStatusDto dto)
    {
        try
        {
            var result = await _taskService.UpdateStatusAsync(id, GetUserId(), dto);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(new { message = "Task not found." }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    /// <summary>
    /// DELETE /api/projects/{projectId}/tasks/{id} — Soft delete task
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int projectId, int id)
    {
        try
        {
            await _taskService.DeleteAsync(id, GetUserId());
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(new { message = "Task not found." }); }
    }
}

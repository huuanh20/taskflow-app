using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.Application.DTOs.Projects;
using TaskFlow.Application.Interfaces;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// POST /api/projects — Create a new project
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectDto dto)
    {
        var result = await _projectService.CreateAsync(GetUserId(), dto);
        return StatusCode(201, result);
    }

    /// <summary>
    /// GET /api/projects — Get all projects for current user
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetMyProjects()
    {
        var projects = await _projectService.GetByOwnerAsync(GetUserId());
        return Ok(projects);
    }

    /// <summary>
    /// GET /api/projects/{id} — Get project details with tasks
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var project = await _projectService.GetByIdAsync(id);
        if (project == null) return NotFound(new { message = "Project not found." });
        return Ok(project);
    }

    /// <summary>
    /// PUT /api/projects/{id} — Update project info
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectDto dto)
    {
        try
        {
            var result = await _projectService.UpdateAsync(id, GetUserId(), dto);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(new { message = "Project not found." }); }
        catch (UnauthorizedAccessException ex) { return Forbid(); }
    }

    /// <summary>
    /// DELETE /api/projects/{id} — Soft delete a project
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _projectService.DeleteAsync(id, GetUserId());
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(new { message = "Project not found." }); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }
}

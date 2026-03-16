using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.Application.DTOs.Labels;
using TaskFlow.Application.Interfaces;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LabelsController : ControllerBase
{
    private readonly ILabelService _labelService;

    public LabelsController(ILabelService labelService)
    {
        _labelService = labelService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var labels = await _labelService.GetAllAsync();
        return Ok(labels);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateLabelDto dto)
    {
        try
        {
            var result = await _labelService.CreateAsync(dto);
            return StatusCode(201, result);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }
}

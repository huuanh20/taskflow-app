using TaskFlow.Application.DTOs.Tasks;

namespace TaskFlow.Application.Interfaces;

public interface ITaskService
{
    Task<TaskDto> CreateAsync(int projectId, CreateTaskDto dto);
    Task<TaskDto?> GetByIdAsync(int taskId);
    Task<PagedResultDto<TaskDto>> GetFilteredAsync(int projectId, TaskFilterDto filter);
    Task<TaskDto> UpdateAsync(int taskId, int userId, UpdateTaskDto dto);
    Task<TaskDto> UpdateStatusAsync(int taskId, int userId, UpdateTaskStatusDto dto);
    Task DeleteAsync(int taskId, int userId);
}

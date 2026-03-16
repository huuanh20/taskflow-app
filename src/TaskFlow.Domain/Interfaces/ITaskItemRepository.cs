using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Enums;

namespace TaskFlow.Domain.Interfaces;

public interface ITaskItemRepository : IGenericRepository<TaskItem>
{
    Task<IEnumerable<TaskItem>> GetTasksByProjectAsync(int projectId);
    Task<IEnumerable<TaskItem>> GetTasksByAssigneeAsync(int assigneeId);
    Task<TaskItem?> GetTaskWithDetailsAsync(int taskId);
    Task<(IEnumerable<TaskItem> Items, int TotalCount)> GetTasksFilteredAsync(
        int projectId,
        TaskItemStatus? status = null,
        TaskItemPriority? priority = null,
        int? assigneeId = null,
        string? search = null,
        string? sortBy = null,
        string? sortOrder = null,
        int pageNumber = 1,
        int pageSize = 10);
}

using AutoMapper;
using TaskFlow.Application.DTOs.Tasks;
using TaskFlow.Application.Interfaces;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Enums;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.Services;

public class TaskService : ITaskService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public TaskService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<TaskDto> CreateAsync(int projectId, CreateTaskDto dto)
    {
        // Verify project exists
        var project = await _unitOfWork.Projects.GetByIdAsync(projectId)
            ?? throw new KeyNotFoundException("Project not found.");

        var taskItem = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            AssigneeId = dto.AssigneeId,
            DueDate = dto.DueDate,
            ProjectId = projectId,
            Status = TaskItemStatus.Todo
        };

        await _unitOfWork.TaskItems.AddAsync(taskItem);
        await _unitOfWork.SaveChangesAsync();

        var created = await _unitOfWork.TaskItems.GetTaskWithDetailsAsync(taskItem.Id);
        return _mapper.Map<TaskDto>(created);
    }

    public async Task<TaskDto?> GetByIdAsync(int taskId)
    {
        var task = await _unitOfWork.TaskItems.GetTaskWithDetailsAsync(taskId);
        return task == null ? null : _mapper.Map<TaskDto>(task);
    }

    public async Task<PagedResultDto<TaskDto>> GetFilteredAsync(int projectId, TaskFilterDto filter)
    {
        var (items, totalCount) = await _unitOfWork.TaskItems.GetTasksFilteredAsync(
            projectId,
            filter.Status,
            filter.Priority,
            filter.AssigneeId,
            filter.Search,
            filter.SortBy,
            filter.SortOrder,
            filter.PageNumber,
            filter.PageSize);

        return new PagedResultDto<TaskDto>
        {
            Items = _mapper.Map<IEnumerable<TaskDto>>(items),
            TotalCount = totalCount,
            PageNumber = filter.PageNumber,
            PageSize = filter.PageSize
        };
    }

    public async Task<TaskDto> UpdateAsync(int taskId, int userId, UpdateTaskDto dto)
    {
        var task = await _unitOfWork.TaskItems.GetByIdAsync(taskId)
            ?? throw new KeyNotFoundException("Task not found.");

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Priority = dto.Priority;
        task.AssigneeId = dto.AssigneeId;
        task.DueDate = dto.DueDate;
        task.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.TaskItems.Update(task);
        await _unitOfWork.SaveChangesAsync();

        var updated = await _unitOfWork.TaskItems.GetTaskWithDetailsAsync(taskId);
        return _mapper.Map<TaskDto>(updated!);
    }

    public async Task<TaskDto> UpdateStatusAsync(int taskId, int userId, UpdateTaskStatusDto dto)
    {
        var task = await _unitOfWork.TaskItems.GetByIdAsync(taskId)
            ?? throw new KeyNotFoundException("Task not found.");

        // Validate status transition (business rule from SRS)
        ValidateStatusTransition(task.Status, dto.Status);

        task.Status = dto.Status;
        task.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.TaskItems.Update(task);
        await _unitOfWork.SaveChangesAsync();

        var updated = await _unitOfWork.TaskItems.GetTaskWithDetailsAsync(taskId);
        return _mapper.Map<TaskDto>(updated!);
    }

    public async Task DeleteAsync(int taskId, int userId)
    {
        var task = await _unitOfWork.TaskItems.GetByIdAsync(taskId)
            ?? throw new KeyNotFoundException("Task not found.");

        // Soft delete
        task.IsDeleted = true;
        task.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.TaskItems.Update(task);
        await _unitOfWork.SaveChangesAsync();
    }

    /// <summary>
    /// Validates task status transitions according to the state diagram:
    /// Todo → InProgress → Review → Done
    /// Review → InProgress (reject)
    /// </summary>
    private static void ValidateStatusTransition(TaskItemStatus current, TaskItemStatus next)
    {
        var validTransitions = new Dictionary<TaskItemStatus, TaskItemStatus[]>
        {
            { TaskItemStatus.Todo, new[] { TaskItemStatus.InProgress } },
            { TaskItemStatus.InProgress, new[] { TaskItemStatus.Review } },
            { TaskItemStatus.Review, new[] { TaskItemStatus.Done, TaskItemStatus.InProgress } },
            { TaskItemStatus.Done, Array.Empty<TaskItemStatus>() }
        };

        if (!validTransitions.ContainsKey(current) ||
            !validTransitions[current].Contains(next))
        {
            throw new InvalidOperationException(
                $"Invalid status transition: {current} → {next}. " +
                $"Allowed: {string.Join(", ", validTransitions[current])}");
        }
    }
}

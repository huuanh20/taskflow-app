using Microsoft.EntityFrameworkCore;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Enums;
using TaskFlow.Domain.Interfaces;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.Infrastructure.Repositories;

public class TaskItemRepository : GenericRepository<TaskItem>, ITaskItemRepository
{
    public TaskItemRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<TaskItem>> GetTasksByProjectAsync(int projectId)
    {
        return await _dbSet
            .Where(t => t.ProjectId == projectId)
            .Include(t => t.Assignee)
            .Include(t => t.TaskLabels).ThenInclude(tl => tl.Label)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<TaskItem>> GetTasksByAssigneeAsync(int assigneeId)
    {
        return await _dbSet
            .Where(t => t.AssigneeId == assigneeId)
            .Include(t => t.Project)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<TaskItem?> GetTaskWithDetailsAsync(int taskId)
    {
        return await _dbSet
            .Include(t => t.Project)
            .Include(t => t.Assignee)
            .Include(t => t.Comments.OrderByDescending(c => c.CreatedAt))
                .ThenInclude(c => c.User)
            .Include(t => t.TaskLabels).ThenInclude(tl => tl.Label)
            .FirstOrDefaultAsync(t => t.Id == taskId);
    }

    public async Task<(IEnumerable<TaskItem> Items, int TotalCount)> GetTasksFilteredAsync(
        int projectId,
        TaskItemStatus? status = null,
        TaskItemPriority? priority = null,
        int? assigneeId = null,
        string? search = null,
        string? sortBy = null,
        string? sortOrder = null,
        int pageNumber = 1,
        int pageSize = 10)
    {
        var query = _dbSet
            .Where(t => t.ProjectId == projectId)
            .AsQueryable();

        // Filtering
        if (status.HasValue)
            query = query.Where(t => t.Status == status.Value);

        if (priority.HasValue)
            query = query.Where(t => t.Priority == priority.Value);

        if (assigneeId.HasValue)
            query = query.Where(t => t.AssigneeId == assigneeId.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(t =>
                t.Title.Contains(search) ||
                (t.Description != null && t.Description.Contains(search)));

        // Total count before pagination
        var totalCount = await query.CountAsync();

        // Sorting
        query = sortBy?.ToLower() switch
        {
            "title" => sortOrder == "desc"
                ? query.OrderByDescending(t => t.Title)
                : query.OrderBy(t => t.Title),
            "priority" => sortOrder == "desc"
                ? query.OrderByDescending(t => t.Priority)
                : query.OrderBy(t => t.Priority),
            "duedate" => sortOrder == "desc"
                ? query.OrderByDescending(t => t.DueDate)
                : query.OrderBy(t => t.DueDate),
            "status" => sortOrder == "desc"
                ? query.OrderByDescending(t => t.Status)
                : query.OrderBy(t => t.Status),
            _ => query.OrderByDescending(t => t.CreatedAt)
        };

        // Pagination
        var items = await query
            .Include(t => t.Assignee)
            .Include(t => t.TaskLabels).ThenInclude(tl => tl.Label)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}

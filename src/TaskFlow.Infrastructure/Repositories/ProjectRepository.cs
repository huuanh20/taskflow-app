using Microsoft.EntityFrameworkCore;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Interfaces;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.Infrastructure.Repositories;

public class ProjectRepository : GenericRepository<Project>, IProjectRepository
{
    public ProjectRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Project>> GetProjectsByOwnerAsync(int ownerId)
    {
        return await _dbSet
            .Where(p => p.OwnerId == ownerId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Project?> GetProjectWithTasksAsync(int projectId)
    {
        return await _dbSet
            .Include(p => p.Tasks.Where(t => !t.IsDeleted))
            .Include(p => p.Owner)
            .FirstOrDefaultAsync(p => p.Id == projectId);
    }
}

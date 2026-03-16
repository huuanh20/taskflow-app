using TaskFlow.Domain.Entities;

namespace TaskFlow.Domain.Interfaces;

public interface IProjectRepository : IGenericRepository<Project>
{
    Task<IEnumerable<Project>> GetProjectsByOwnerAsync(int ownerId);
    Task<Project?> GetProjectWithTasksAsync(int projectId);
}

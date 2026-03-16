using TaskFlow.Application.DTOs.Projects;

namespace TaskFlow.Application.Interfaces;

public interface IProjectService
{
    Task<ProjectDto> CreateAsync(int ownerId, CreateProjectDto dto);
    Task<ProjectDto?> GetByIdAsync(int projectId);
    Task<IEnumerable<ProjectDto>> GetByOwnerAsync(int ownerId);
    Task<ProjectDto> UpdateAsync(int projectId, int userId, UpdateProjectDto dto);
    Task DeleteAsync(int projectId, int userId);
}

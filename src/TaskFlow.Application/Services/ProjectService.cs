using AutoMapper;
using TaskFlow.Application.DTOs.Projects;
using TaskFlow.Application.Interfaces;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.Services;

public class ProjectService : IProjectService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ProjectService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ProjectDto> CreateAsync(int ownerId, CreateProjectDto dto)
    {
        var project = new Project
        {
            Name = dto.Name,
            Description = dto.Description,
            OwnerId = ownerId
        };

        await _unitOfWork.Projects.AddAsync(project);
        await _unitOfWork.SaveChangesAsync();

        // Reload with owner info
        var created = await _unitOfWork.Projects.GetProjectWithTasksAsync(project.Id);
        return _mapper.Map<ProjectDto>(created);
    }

    public async Task<ProjectDto?> GetByIdAsync(int projectId)
    {
        var project = await _unitOfWork.Projects.GetProjectWithTasksAsync(projectId);
        return project == null ? null : _mapper.Map<ProjectDto>(project);
    }

    public async Task<IEnumerable<ProjectDto>> GetByOwnerAsync(int ownerId)
    {
        var projects = await _unitOfWork.Projects.GetProjectsByOwnerAsync(ownerId);
        return _mapper.Map<IEnumerable<ProjectDto>>(projects);
    }

    public async Task<ProjectDto> UpdateAsync(int projectId, int userId, UpdateProjectDto dto)
    {
        var project = await _unitOfWork.Projects.GetByIdAsync(projectId)
            ?? throw new KeyNotFoundException("Project not found.");

        if (project.OwnerId != userId)
            throw new UnauthorizedAccessException("Only the project owner can update this project.");

        project.Name = dto.Name;
        project.Description = dto.Description;
        project.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Projects.Update(project);
        await _unitOfWork.SaveChangesAsync();

        var updated = await _unitOfWork.Projects.GetProjectWithTasksAsync(projectId);
        return _mapper.Map<ProjectDto>(updated!);
    }

    public async Task DeleteAsync(int projectId, int userId)
    {
        var project = await _unitOfWork.Projects.GetByIdAsync(projectId)
            ?? throw new KeyNotFoundException("Project not found.");

        if (project.OwnerId != userId)
            throw new UnauthorizedAccessException("Only the project owner can delete this project.");

        // Soft delete
        project.IsDeleted = true;
        project.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Projects.Update(project);
        await _unitOfWork.SaveChangesAsync();
    }
}

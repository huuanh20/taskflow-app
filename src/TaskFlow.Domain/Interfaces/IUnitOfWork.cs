namespace TaskFlow.Domain.Interfaces;

/// <summary>
/// Unit of Work pattern — manages transactions across multiple repositories.
/// Ensures all changes are committed together or rolled back.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IProjectRepository Projects { get; }
    ITaskItemRepository TaskItems { get; }
    ICommentRepository Comments { get; }
    ILabelRepository Labels { get; }
    Task<int> SaveChangesAsync();
}

using TaskFlow.Domain.Interfaces;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.Infrastructure.Repositories;

/// <summary>
/// Unit of Work implementation — coordinates multiple repositories
/// to save all changes in a single database transaction.
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public IUserRepository Users { get; }
    public IProjectRepository Projects { get; }
    public ITaskItemRepository TaskItems { get; }
    public ICommentRepository Comments { get; }
    public ILabelRepository Labels { get; }

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
        Users = new UserRepository(context);
        Projects = new ProjectRepository(context);
        TaskItems = new TaskItemRepository(context);
        Comments = new CommentRepository(context);
        Labels = new LabelRepository(context);
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}

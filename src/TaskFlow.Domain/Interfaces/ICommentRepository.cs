using TaskFlow.Domain.Entities;

namespace TaskFlow.Domain.Interfaces;

public interface ICommentRepository : IGenericRepository<Comment>
{
    Task<IEnumerable<Comment>> GetCommentsByTaskAsync(int taskItemId);
}

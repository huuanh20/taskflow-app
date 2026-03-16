using System.Linq.Expressions;

namespace TaskFlow.Domain.Interfaces;

/// <summary>
/// Generic repository interface — defines standard CRUD operations.
/// All specific repositories inherit from this.
/// </summary>
public interface IGenericRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
}

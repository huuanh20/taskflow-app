using TaskFlow.Domain.Entities;

namespace TaskFlow.Domain.Interfaces;

public interface ILabelRepository : IGenericRepository<Label>
{
    Task<Label?> GetByNameAsync(string name);
    Task<bool> NameExistsAsync(string name);
}

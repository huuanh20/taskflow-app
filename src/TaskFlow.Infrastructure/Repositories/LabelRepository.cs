using Microsoft.EntityFrameworkCore;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Interfaces;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.Infrastructure.Repositories;

public class LabelRepository : GenericRepository<Label>, ILabelRepository
{
    public LabelRepository(AppDbContext context) : base(context) { }

    public async Task<Label?> GetByNameAsync(string name)
    {
        return await _dbSet.FirstOrDefaultAsync(l => l.Name == name);
    }

    public async Task<bool> NameExistsAsync(string name)
    {
        return await _dbSet.AnyAsync(l => l.Name == name);
    }
}

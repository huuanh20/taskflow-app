using TaskFlow.Application.DTOs.Dashboard;

namespace TaskFlow.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardAsync(int userId, int? projectId = null);
}

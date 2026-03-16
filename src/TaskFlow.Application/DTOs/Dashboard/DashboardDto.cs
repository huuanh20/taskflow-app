namespace TaskFlow.Application.DTOs.Dashboard;

public class DashboardDto
{
    public int TotalTasks { get; set; }
    public Dictionary<string, int> TasksByStatus { get; set; } = new();
    public Dictionary<string, int> TasksByPriority { get; set; } = new();
    public List<TaskFlow.Application.DTOs.Tasks.TaskDto> UpcomingDeadlines { get; set; } = new();
    public List<TaskFlow.Application.DTOs.Tasks.TaskDto> MyTasks { get; set; } = new();
}

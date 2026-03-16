namespace TaskFlow.Domain.Entities;

public class Label
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#6366f1";

    // Navigation properties
    public ICollection<TaskLabel> TaskLabels { get; set; } = new List<TaskLabel>();
}

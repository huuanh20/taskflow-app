namespace TaskFlow.Domain.Entities;

/// <summary>
/// Junction table for Many-to-Many relationship between TaskItem and Label.
/// Composite primary key: (TaskItemId, LabelId)
/// </summary>
public class TaskLabel
{
    public int TaskItemId { get; set; }
    public int LabelId { get; set; }

    // Navigation properties
    public TaskItem TaskItem { get; set; } = null!;
    public Label Label { get; set; } = null!;
}

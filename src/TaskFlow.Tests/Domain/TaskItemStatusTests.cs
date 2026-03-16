using FluentAssertions;
using TaskFlow.Domain.Enums;
using Xunit;

namespace TaskFlow.Tests.Domain;

public class TaskItemStatusTests
{
    [Theory]
    [InlineData(TaskItemStatus.Todo, TaskItemStatus.InProgress, true)]
    [InlineData(TaskItemStatus.InProgress, TaskItemStatus.Review, true)]
    [InlineData(TaskItemStatus.Review, TaskItemStatus.Done, true)]
    [InlineData(TaskItemStatus.Review, TaskItemStatus.InProgress, true)]
    [InlineData(TaskItemStatus.Todo, TaskItemStatus.Done, false)]       // Skip not allowed
    [InlineData(TaskItemStatus.Done, TaskItemStatus.Todo, false)]       // Backwards not allowed
    [InlineData(TaskItemStatus.Todo, TaskItemStatus.Review, false)]     // Skip not allowed
    [InlineData(TaskItemStatus.InProgress, TaskItemStatus.Done, false)] // Must go through Review
    public void StatusTransition_ShouldValidateCorrectly(
        TaskItemStatus from, TaskItemStatus to, bool expected)
    {
        // SRS State Diagram: Todo → InProgress → Review → Done (Review can go back to InProgress)
        var validTransitions = new Dictionary<TaskItemStatus, TaskItemStatus[]>
        {
            { TaskItemStatus.Todo, new[] { TaskItemStatus.InProgress } },
            { TaskItemStatus.InProgress, new[] { TaskItemStatus.Review } },
            { TaskItemStatus.Review, new[] { TaskItemStatus.Done, TaskItemStatus.InProgress } },
            { TaskItemStatus.Done, Array.Empty<TaskItemStatus>() },
        };

        var isValid = validTransitions.ContainsKey(from) && validTransitions[from].Contains(to);

        isValid.Should().Be(expected,
            $"transition from {from} to {to} should be {(expected ? "valid" : "invalid")}");
    }

    [Fact]
    public void TaskItemPriority_ShouldHaveCorrectValues()
    {
        ((int)TaskItemPriority.Low).Should().Be(0);
        ((int)TaskItemPriority.Medium).Should().Be(1);
        ((int)TaskItemPriority.High).Should().Be(2);
        ((int)TaskItemPriority.Critical).Should().Be(3);
    }
}

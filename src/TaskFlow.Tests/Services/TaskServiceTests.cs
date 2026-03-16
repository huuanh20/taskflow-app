using AutoMapper;
using FluentAssertions;
using Moq;
using TaskFlow.Application.DTOs.Tasks;
using TaskFlow.Application.Mappings;
using TaskFlow.Application.Services;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Enums;
using TaskFlow.Domain.Interfaces;
using Xunit;

namespace TaskFlow.Tests.Services;

public class TaskServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUow;
    private readonly IMapper _mapper;
    private readonly TaskService _sut;

    public TaskServiceTests()
    {
        _mockUow = new Mock<IUnitOfWork>();
        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();
        _sut = new TaskService(_mockUow.Object, _mapper);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_ShouldReturnTaskDto()
    {
        // Arrange
        var dto = new CreateTaskDto { Title = "Write unit tests", Description = "xUnit + Moq" };
        var project = new Project { Id = 1, Name = "P", OwnerId = 1, Owner = new User { Id = 1, FullName = "U", Email = "e", PasswordHash = "h" } };
        var createdTask = new TaskItem
        {
            Id = 1, Title = "Write unit tests", Description = "xUnit + Moq",
            ProjectId = 1, Status = TaskItemStatus.Todo, Priority = TaskItemPriority.Medium,
            Project = project
        };

        _mockUow.Setup(u => u.Projects.GetByIdAsync(1)).ReturnsAsync(project);
        _mockUow.Setup(u => u.TaskItems.AddAsync(It.IsAny<TaskItem>())).Returns(Task.CompletedTask);
        _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
        _mockUow.Setup(u => u.TaskItems.GetTaskWithDetailsAsync(It.IsAny<int>())).ReturnsAsync(createdTask);

        // Act
        var result = await _sut.CreateAsync(1, dto);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be("Write unit tests");
        result.Status.Should().Be(TaskItemStatus.Todo);
    }

    [Fact]
    public async Task CreateAsync_WithInvalidProject_ShouldThrow()
    {
        // Arrange
        var dto = new CreateTaskDto { Title = "Task" };
        _mockUow.Setup(u => u.Projects.GetByIdAsync(999)).ReturnsAsync((Project?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _sut.CreateAsync(999, dto));
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_ShouldReturnTask()
    {
        // Arrange
        var task = new TaskItem
        {
            Id = 1, Title = "Test Task", Status = TaskItemStatus.InProgress,
            ProjectId = 1, Project = new Project { Id = 1, Name = "P", OwnerId = 1, Owner = new User { Id = 1, FullName = "U", Email = "e", PasswordHash = "h" } }
        };
        _mockUow.Setup(u => u.TaskItems.GetTaskWithDetailsAsync(1)).ReturnsAsync(task);

        // Act
        var result = await _sut.GetByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.Title.Should().Be("Test Task");
        result.Status.Should().Be(TaskItemStatus.InProgress);
    }

    [Fact]
    public async Task GetByIdAsync_WithInvalidId_ShouldReturnNull()
    {
        // Arrange
        _mockUow.Setup(u => u.TaskItems.GetTaskWithDetailsAsync(999)).ReturnsAsync((TaskItem?)null);

        // Act
        var result = await _sut.GetByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateStatusAsync_ValidTransition_ShouldSucceed()
    {
        // Arrange: Todo → InProgress is valid
        var task = new TaskItem
        {
            Id = 1, Title = "T", Status = TaskItemStatus.Todo,
            ProjectId = 1, Project = new Project { Id = 1, Name = "P", OwnerId = 1, Owner = new User { Id = 1, FullName = "U", Email = "e", PasswordHash = "h" } }
        };
        _mockUow.Setup(u => u.TaskItems.GetByIdAsync(1)).ReturnsAsync(task);
        _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
        _mockUow.Setup(u => u.TaskItems.GetTaskWithDetailsAsync(1)).ReturnsAsync(task);

        // Act
        var result = await _sut.UpdateStatusAsync(1, 1, new UpdateTaskStatusDto { Status = TaskItemStatus.InProgress });

        // Assert
        result.Should().NotBeNull();
        task.Status.Should().Be(TaskItemStatus.InProgress);
    }

    [Fact]
    public async Task UpdateStatusAsync_InvalidTransition_ShouldThrow()
    {
        // Arrange: Todo → Done is NOT valid (must go through InProgress, Review)
        var task = new TaskItem { Id = 1, Title = "T", Status = TaskItemStatus.Todo, ProjectId = 1 };
        _mockUow.Setup(u => u.TaskItems.GetByIdAsync(1)).ReturnsAsync(task);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _sut.UpdateStatusAsync(1, 1, new UpdateTaskStatusDto { Status = TaskItemStatus.Done })
        );
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_ShouldSoftDelete()
    {
        // Arrange
        var task = new TaskItem { Id = 1, Title = "T", ProjectId = 1, IsDeleted = false };
        _mockUow.Setup(u => u.TaskItems.GetByIdAsync(1)).ReturnsAsync(task);
        _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

        // Act
        await _sut.DeleteAsync(1, 1);

        // Assert
        task.IsDeleted.Should().BeTrue();
        _mockUow.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WithInvalidId_ShouldThrow()
    {
        // Arrange
        _mockUow.Setup(u => u.TaskItems.GetByIdAsync(999)).ReturnsAsync((TaskItem?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _sut.DeleteAsync(999, 1));
    }
}

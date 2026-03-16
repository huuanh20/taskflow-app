using AutoMapper;
using FluentAssertions;
using Moq;
using TaskFlow.Application.DTOs.Projects;
using TaskFlow.Application.Mappings;
using TaskFlow.Application.Services;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Interfaces;
using Xunit;

namespace TaskFlow.Tests.Services;

public class ProjectServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUow;
    private readonly IMapper _mapper;
    private readonly ProjectService _sut;

    public ProjectServiceTests()
    {
        _mockUow = new Mock<IUnitOfWork>();
        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();
        _sut = new ProjectService(_mockUow.Object, _mapper);
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnProjectDto()
    {
        // Arrange
        var dto = new CreateProjectDto { Name = "Test Project", Description = "Test" };
        _mockUow.Setup(u => u.Projects.AddAsync(It.IsAny<Project>()))
            .Returns(Task.CompletedTask);
        _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
        _mockUow.Setup(u => u.Projects.GetProjectWithTasksAsync(It.IsAny<int>()))
            .ReturnsAsync(new Project
            {
                Id = 1, Name = "Test Project", Description = "Test", OwnerId = 1,
                Owner = new User { Id = 1, FullName = "Test User", Email = "test@test.com", PasswordHash = "hash" }
            });

        // Act
        var result = await _sut.CreateAsync(1, dto);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Test Project");
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_ShouldReturnProject()
    {
        // Arrange
        var project = new Project
        {
            Id = 1, Name = "My Project", Description = "Desc", OwnerId = 1,
            Owner = new User { Id = 1, FullName = "User", Email = "u@test.com", PasswordHash = "h" }
        };
        _mockUow.Setup(u => u.Projects.GetProjectWithTasksAsync(1)).ReturnsAsync(project);

        // Act
        var result = await _sut.GetByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("My Project");
    }

    [Fact]
    public async Task GetByIdAsync_WithInvalidId_ShouldReturnNull()
    {
        // Arrange
        _mockUow.Setup(u => u.Projects.GetProjectWithTasksAsync(999)).ReturnsAsync((Project?)null);

        // Act
        var result = await _sut.GetByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_NotOwner_ShouldThrow()
    {
        // Arrange
        var project = new Project { Id = 1, OwnerId = 1, Name = "P", Owner = new User { Id = 1, FullName = "U", Email = "e", PasswordHash = "h" } };
        _mockUow.Setup(u => u.Projects.GetByIdAsync(1)).ReturnsAsync(project);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _sut.DeleteAsync(1, 999)
        );
    }
}

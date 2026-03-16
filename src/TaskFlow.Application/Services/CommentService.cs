using AutoMapper;
using TaskFlow.Application.DTOs.Comments;
using TaskFlow.Application.Interfaces;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.Services;

public class CommentService : ICommentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CommentService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<CommentDto> CreateAsync(int taskItemId, int userId, CreateCommentDto dto)
    {
        var task = await _unitOfWork.TaskItems.GetByIdAsync(taskItemId)
            ?? throw new KeyNotFoundException("Task not found.");

        var comment = new Comment
        {
            Content = dto.Content,
            TaskItemId = taskItemId,
            UserId = userId
        };

        await _unitOfWork.Comments.AddAsync(comment);
        await _unitOfWork.SaveChangesAsync();

        var created = (await _unitOfWork.Comments.GetCommentsByTaskAsync(taskItemId))
            .FirstOrDefault(c => c.Id == comment.Id);
        return _mapper.Map<CommentDto>(created);
    }

    public async Task<IEnumerable<CommentDto>> GetByTaskAsync(int taskItemId)
    {
        var comments = await _unitOfWork.Comments.GetCommentsByTaskAsync(taskItemId);
        return _mapper.Map<IEnumerable<CommentDto>>(comments);
    }

    public async Task DeleteAsync(int commentId, int userId)
    {
        var comment = await _unitOfWork.Comments.GetByIdAsync(commentId)
            ?? throw new KeyNotFoundException("Comment not found.");

        if (comment.UserId != userId)
            throw new UnauthorizedAccessException("Only the comment author can delete.");

        _unitOfWork.Comments.Delete(comment);
        await _unitOfWork.SaveChangesAsync();
    }
}

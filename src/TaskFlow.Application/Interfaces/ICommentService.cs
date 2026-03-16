using TaskFlow.Application.DTOs.Comments;

namespace TaskFlow.Application.Interfaces;

public interface ICommentService
{
    Task<CommentDto> CreateAsync(int taskItemId, int userId, CreateCommentDto dto);
    Task<IEnumerable<CommentDto>> GetByTaskAsync(int taskItemId);
    Task DeleteAsync(int commentId, int userId);
}

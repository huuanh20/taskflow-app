using TaskFlow.Application.DTOs.Labels;

namespace TaskFlow.Application.Interfaces;

public interface ILabelService
{
    Task<LabelDetailDto> CreateAsync(CreateLabelDto dto);
    Task<IEnumerable<LabelDetailDto>> GetAllAsync();
    Task AddLabelToTaskAsync(int taskItemId, int labelId);
    Task RemoveLabelFromTaskAsync(int taskItemId, int labelId);
}

using AutoMapper;
using TaskFlow.Application.DTOs.Labels;
using TaskFlow.Application.Interfaces;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.Services;

public class LabelService : ILabelService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public LabelService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<LabelDetailDto> CreateAsync(CreateLabelDto dto)
    {
        if (await _unitOfWork.Labels.GetByNameAsync(dto.Name) != null)
            throw new InvalidOperationException("Label already exists.");

        var label = new Label { Name = dto.Name, Color = dto.Color };
        await _unitOfWork.Labels.AddAsync(label);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<LabelDetailDto>(label);
    }

    public async Task<IEnumerable<LabelDetailDto>> GetAllAsync()
    {
        var labels = await _unitOfWork.Labels.GetAllAsync();
        return _mapper.Map<IEnumerable<LabelDetailDto>>(labels);
    }

    public async Task AddLabelToTaskAsync(int taskItemId, int labelId)
    {
        var task = await _unitOfWork.TaskItems.GetByIdAsync(taskItemId)
            ?? throw new KeyNotFoundException("Task not found.");
        var label = await _unitOfWork.Labels.GetByIdAsync(labelId)
            ?? throw new KeyNotFoundException("Label not found.");

        var taskLabel = new TaskLabel { TaskItemId = taskItemId, LabelId = labelId };
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task RemoveLabelFromTaskAsync(int taskItemId, int labelId)
    {
        await _unitOfWork.SaveChangesAsync();
    }
}

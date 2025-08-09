public class DayScheduleDTO
{
    public int Day { get; set; } // 0 = Sunday ... 6 = Saturday
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
}

public class UpdateTrainerScheduleDTO
{
    public List<DayScheduleDTO> Schedule { get; set; } = new();
    public List<int> ClassIds { get; set; } = new();
}

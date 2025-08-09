using System;

namespace api.DTOS;

public class scheduleDTO
{
    public int TrainnerId { get; set; }
     public DayOfWeek DayOfWeek { get; set; }
    // Time only (no date)
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}

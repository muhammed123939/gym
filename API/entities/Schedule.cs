using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.entities;

public class Schedule
{
    public int Id { get; set; }

    [ForeignKey("Trainners")]
    public int TrainnerId { get; set; }
    public Trainners Trainners { get; set; }

    // Enum for day of week (e.g., Monday, Tuesday, etc.)
    public DayOfWeek DayOfWeek { get; set; }

    // Time only (no date)
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }

}

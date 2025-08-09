using System;
using System.Collections.Generic;

namespace api.DTOS
{
    public class TrainnerMemberDTO
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public int Age { get; set; }
        public DateTime DateOfBirth { get; set; }

        public List<int>? ClassIds { get; set; } = new(); // Changed from single classId

        public int AdminId { get; set; }
        public string? Password { get; set; }
        public int TrainnerPrice { get; set; }

        public List<DayScheduleDTO>? Schedule { get; set; } // Optional: day-wise schedule
    }

    public class DayScheduleDTO
    {
        public int Day { get; set; } // 0 = Sunday, ..., 6 = Saturday
        public string StartTime { get; set; } = string.Empty; // "HH:mm" format
        public string EndTime { get; set; } = string.Empty;
    }
}

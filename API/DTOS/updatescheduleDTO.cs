using System;

namespace api.DTOS;

public class updatescheduleDTO
{
   public List<int> AvailableDays { get; set; }   // e.g., [0,1,3] for Sunday, Monday, Wednesday
    public string StartTime { get; set; }          // e.g., "09:00"
    public string EndTime { get; set; }  
}

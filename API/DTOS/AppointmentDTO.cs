using System;

namespace api.DTOS;

public class AppointmentDTO
{
    public int Id { get; set; }
    public int TrainnerId { get; set; }
    public int AdminId { get; set; }
    public int ClientId { get; set; }
    public int ClassId { get; set; }
    public string? Clientcase { get; set; }
    public string? Clientcomment { get; set; }

    public DateOnly Date { get; set; }
    public TimeOnly Time { get; set; } 
    public bool? hasPhoto { get; set; } 
    public string? publicId { get; set; }     
}

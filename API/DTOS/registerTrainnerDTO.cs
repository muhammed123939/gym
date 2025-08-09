using System;
using System.ComponentModel.DataAnnotations;

namespace api.DTOS;

public class registerTrainnerDTO
{
    [Required]
    public string? trainnername { get; set; } = string.Empty;

    [Required] public DateTime DateOfBirth { get; set; }
    [Required] public int adminId { get; set; }
}

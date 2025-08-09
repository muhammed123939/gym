using System;
using System.ComponentModel.DataAnnotations;

namespace api.DTOS;

public class RegisterDTO
{
    [Required]
    public string adminname { get; set; } = string.Empty;

    [Required]
    [StringLength(8, MinimumLength = 4)]
    public string adminpassword { get; set; } = string.Empty;
   

    public bool cando { get; set; } 
}

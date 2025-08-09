namespace api.Data;

public class RegisterClientDTO
{
    public int Id { get; set; }
    public string? name { get; set; } = string.Empty;
    public string? email { get; set; } 
   
    public string? gender { get; set; } = string.Empty;
    public string? mobile { get; set; } = string.Empty;
    public DateTime  DateOfBirth { get; set; } 
    public int adminId { get; set; }
    public string nationalNumber { get; set; }

}

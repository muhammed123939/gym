using System;

namespace api.DTOS;

public class ClientMemberUpdateDTO
{
    public int id { get; set; }
    public string name { get; set; }
    public int age { get; set; }    
    public string gender { get; set; }
     public string mobileNumber { get; set; } 
    public DateTime  dateOfBirth { get; set; } 
    public int adminId { get; set; }
    public string? nationalNumber { get; set; }
    
    public byte[] passwordHash { get; set; } = [];
    public byte[] passwordSalt { get; set; } = [];
}

using System;

namespace api.DTOS;

public class TrainnerMemberUpdateDTO
{
    public int id { get; set; }
    public string name { get; set; }
    public DateTime dateOfBirth { get; set; }
    public int adminId { get; set; }
    public int trainnerprice { get; set; }

    public byte[]? passwordHash { get; set; } 
     public byte[]? passwordSalt { get; set; } 
}

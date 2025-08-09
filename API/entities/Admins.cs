using System.ComponentModel.DataAnnotations.Schema;
using api.entities;

namespace API.entities;

public class Admins
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public byte[] PasswordHash { get; set; } = [];
    public byte[] PasswordSalt { get; set; } = [];
    public bool CanDo { get; set; }
    
    public List<Trainners> Trainners { get; set; } =[];
    public List<Appointments> Appointments { get; set; } 
    public List <Clients> Clients { get; set; } 
}

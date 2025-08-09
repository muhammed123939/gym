using System;
using System.ComponentModel.DataAnnotations.Schema;
using API.entities;

namespace api.entities;

public class Trainners
{

    public required int Id { get; set; }
    public required string Name { get; set; }
    public required byte[] PasswordHash { get; set; } = [];
    public required byte[] PasswordSalt { get; set; } = [];
    public required DateTime DateOfBirth { get; set; }
    public required int TrainnerPrice { get; set; }

    [ForeignKey("Admins")]
    public int AdminId { get; set; }
    public Admins Admins { get; set; }
    public ICollection<TrainnerClass> TrainnerClasses { get; set; } = new List<TrainnerClass>();
    // public ICollection<Clients> Clients { get; set; } =null!;
    public ICollection<Schedule> Schedules { get; set; }
    public Photos Photos { get; set; } 
    public List<Appointments> Appointments { get; set; } = [];
    public List<ClientsPhotos>? ClientsPhotos { get; set; } = new();
  public ICollection<ClientTrainner> ClientTrainners { get; set; }
  
    [NotMapped] // This property will not be stored in the database
    public int Age => CalculateAge();

    private int CalculateAge()
    {
        var today = DateTime.Today;
        var age = today.Year - DateOfBirth.Year;
        if (DateOfBirth.Date > today.AddYears(-age)) 
            age--;
        return age;
    }

}

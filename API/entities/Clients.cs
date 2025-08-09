using System;
using System.ComponentModel.DataAnnotations.Schema;
using API.entities;

namespace api.entities;

public class Clients
{

    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public bool EmailConfirmed { get; set; } = false;
    public required string Gender { get; set; }
    public required string MobileNumber { get; set; }
    public string NationalNumber { get; set; }
    public required DateTime DateOfBirth { get; set; }
    public byte[]? PasswordHash { get; set; } = [];
    public byte[]? PasswordSalt { get; set; } = [];

    [ForeignKey("Admins")]
    public int AdminId { get; set; }
    public Admins Admins { get; set; }

    public EmailToken EmailToken { get; set; } = null!;
    public ICollection<ClientsPhotos> ClientsPhotos { get; set; } = new List<ClientsPhotos>();

    // public ICollection<Trainners> Trainners { get; set; } = null!;

    public List<Classes> Classes { get; set; } = [];
    public List<Appointments> Appointments { get; set; } = [];
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

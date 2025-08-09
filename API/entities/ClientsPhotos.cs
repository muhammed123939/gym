using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.entities;

public class ClientsPhotos
{

    [Key]
    public int Id { get; set; }
    public required string Url { get; set; }
    public required string publicId { get; set; }

    [ForeignKey("Clients")]
    public int ClientId { get; set; }
    public Clients Clients { get; set; }

    [ForeignKey("Appointments")]
    public int AppointmentId { get; set; }
    public Appointments Appointments { get; set; }

    [ForeignKey("Trainners")]
    public int TrainnersId { get; set; }
    public Trainners Trainners { get; set; }

}
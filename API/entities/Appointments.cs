using System;
using System.ComponentModel.DataAnnotations.Schema;
using API.entities;

namespace api.entities;

public class Appointments
{
    public required int Id { get; set; }

    [ForeignKey("Classes")]
    public int ClassId { get; set; }

    [ForeignKey("Trainners")]
    public int TrainnerId { get; set; }
    public  Trainners Trainners{ get; set; }

    [ForeignKey("Clients")]
    public int ClientId { get; set; }
    public  Clients Clients{ get; set; }

     [ForeignKey("Admins")]
    public int AdminId { get; set; }
    public  Admins Admins{ get; set; }

    public string clientcase { get; set; }
    public string clientcomment { get; set; }
    public required DateOnly Date { get; set; }
    public required TimeOnly Time { get; set; }
    
}

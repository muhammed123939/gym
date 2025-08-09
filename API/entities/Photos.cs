using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using api.entities;

namespace API.entities;

public class Photos
{
    [Key]
    public int Id { get; set; }
    public required string Url { get; set; }
    public required string publicId { get; set; }

    [ForeignKey("Trainners")]
    public int TrainnerId { get; set; }

    public Trainners Trainners { get; set; }
}

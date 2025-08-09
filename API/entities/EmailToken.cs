using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using api.entities;

namespace API.entities;


public class EmailToken
{
    public int Id { get; set; }

    [ForeignKey("Clients")]
    public int ClientId { get; set; }
    // Navigation property
    public Clients Client { get; set; } = null!;

    public string Token { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
}

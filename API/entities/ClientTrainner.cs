using System;

namespace api.entities;

public class ClientTrainner
{
  public int ClientId { get; set; }
    public Clients Client { get; set; }

    public int TrainnerId { get; set; }
    public Trainners Trainner { get; set; }
}

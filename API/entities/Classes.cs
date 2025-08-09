using System;

namespace api.entities;

public class Classes
{
public int Id { get; set; }
public required string Name { get; set; }
public List<Appointments>? Appointments { get; set; } = new();
public ICollection<TrainnerClass> TrainnerClasses { get; set; } = new List<TrainnerClass>();
public List<Clients>? Clients { get; set; } = new();

}

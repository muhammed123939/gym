using System;

namespace api.entities;

public class TrainnerClass
{
  public int TrainnerId { get; set; }
    public Trainners Trainner { get; set; }

    public int ClassId { get; set; }
    public Classes Class { get; set; }
}

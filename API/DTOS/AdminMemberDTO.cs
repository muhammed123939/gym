using System;

namespace api.DTOS;

public class AdminMemberDTO
{
    public int id { get; set; }
     public string? name { get; set; }
    public bool? canDo { get; set; }
    public string? password { get; set; }
}

using System;

namespace api.DTOS;

public class AdminMemberUpdateDTO
{
    public int id { get; set; }
    public string? name { get; set; }
    public byte[] passwordHash { get; set; } = [];
    public byte[] passwordSalt { get; set; } = [];
    public bool? canDo { get; set; }
}

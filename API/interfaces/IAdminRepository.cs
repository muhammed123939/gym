using System;
using api.DTOS;
using API.entities;
using Microsoft.AspNetCore.Mvc;

namespace API.interfaces;

public interface IAdminRepository

{
    void delete (Admins admin);
    Task<Admins?> GetAdminById(int id);
    Task<bool> SaveAllAsync();
    Task<IEnumerable<AdminMemberDTO>> GetAdminsmemAsync();

}

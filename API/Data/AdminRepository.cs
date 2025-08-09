using api.DTOS;
using API.entities;
using API.interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class AdminRepository (DataContext context, IMapper mapper) : IAdminRepository
{
      public void delete (Admins admin)
    {
        context.Admin.Remove(admin) ;
    }

    public async Task<Admins?> GetAdminById(int id)
    {
         return await context.Admin.FindAsync(id);
    }

    public async Task<bool> SaveAllAsync()
    {
            return await context.SaveChangesAsync() > 0;
    }

    public async Task<IEnumerable<AdminMemberDTO>> GetAdminsmemAsync()
    {
        return await context.Admin
        .ProjectTo<AdminMemberDTO>(mapper.ConfigurationProvider)
        .ToListAsync();
    }
 
}

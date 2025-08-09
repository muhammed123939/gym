using System;
using api.entities;
using api.interfaces;
using API.Data;
using AutoMapper;

namespace api.Data;

public class ClientRepository (DataContext context, IMapper mapper) : IClientRepository
{
    public void delete(Clients patient)
    {
        context.Clients.Remove(patient) ;
    }

    public async Task<Clients?> GetClientById(int id)
    {
        return await context.Clients.FindAsync(id);
    }

    public async Task<bool> SaveAllAsync()
    {
        return await context.SaveChangesAsync() > 0;
    }
}

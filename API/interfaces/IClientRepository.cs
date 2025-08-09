using System;
using api.entities;

namespace api.interfaces;

public interface IClientRepository
{
    void delete (Clients client);
    Task<Clients?> GetClientById(int id);
    Task<bool> SaveAllAsync();
}

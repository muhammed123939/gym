using System;
using api.interfaces;
using api.DTOS;
using API.entities;
using API.interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using api.entities;

namespace API.Data;

public class AppointmentRepository (DataContext context, IMapper mapper) : IAppointmentRepository
{
    public void delete(Appointments appointment)
    {
        context.Appointments.Remove(appointment) ;

    }

    public async Task<Appointments?> GetAppointmentsById(int id)
    {
         return await context.Appointments.FindAsync(id);
    }

   public async Task<bool> SaveAllAsync()
    {
            return await context.SaveChangesAsync() > 0;
    }

}

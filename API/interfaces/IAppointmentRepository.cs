using System;
using api.entities;

namespace api.interfaces;

public interface IAppointmentRepository
{
     void delete (Appointments appointment);
    Task<Appointments?> GetAppointmentsById(int id);
    Task<bool> SaveAllAsync();
}

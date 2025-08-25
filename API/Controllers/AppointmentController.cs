using API.Data;
using api.DTOS;
using API.entities;
using API.interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Controllers;
using api.interfaces;
using api.entities;
using API.Services;
using API.SignalR;
using Microsoft.AspNetCore.SignalR;


namespace api.Controllers
{

    public class AppointmentController(
        DataContext context,
        ItokenService tokenService,
        IMapper mapper,
        IAppointmentRepository appointmentRepository,
        IPhotoService photoService,
        NotificationService _notificationService   // ✅ Add here
    ) : BaseApiController
    {
        
                private List<TimeSlot> GenerateTimeSlots(TimeSpan start, TimeSpan end, TimeSpan interval)
        {
            var slots = new List<TimeSlot>();
            var current = start;

            while (current + interval <= end)
            {
                slots.Add(new TimeSlot
                {
                    Start = current,
                    End = current + interval
                });

                current += interval;
            }

            return slots;
        }

        [HttpGet("GetAvailableSlots")]
        public async Task<List<TimeSlot>> GetAvailableSlots(int trainnerId, DateTime date)
        {
            var schedule = await context.Schedules
                .Where(s => s.TrainnerId == trainnerId && s.DayOfWeek == date.DayOfWeek)
                .FirstOrDefaultAsync();

            if (schedule == null) return new List<TimeSlot>();

            var dateOnly = DateOnly.FromDateTime(date);

            var appointments = await context.Appointments
                .Where(a => a.TrainnerId == trainnerId && a.Date == dateOnly)
                .ToListAsync();

            var slots = GenerateTimeSlots(schedule.StartTime, schedule.EndTime, TimeSpan.FromMinutes(30));

            foreach (var appt in appointments)
            {
                slots.RemoveAll(s => s.Start == appt.Time.ToTimeSpan()); // ✅ both are TimeSpan now

            }

            return slots;
        }

        [HttpGet("getClasses")]
        public async Task<ActionResult<IEnumerable<AdminAddedDTO>>> getClasses()
        {
            var classes = context.Trainners.FromSqlInterpolated($"SELECT c.Id, c.Name FROM Classes c JOIN Appointments a ON a.ClassId = c.Id GROUP BY a.Id").Select(e => new AdminAddedDTO
            {
                id = e.Id,
                name = e.Name
            })
    .ToList();
            return Ok(classes);
        }

        [HttpGet("getTrainners")]
        public async Task<ActionResult<IEnumerable<AdminAddedDTO>>> getTrainners()
        {
            var trainners = context.Trainners.FromSqlInterpolated($"SELECT t.Id, t.Name FROM Trainners t JOIN Appointments a ON a.TrainnerId = t.Id GROUP BY a.Id").Select(e => new AdminAddedDTO
            {
                id = e.Id,
                name = e.Name
            })
    .ToList();
            return Ok(trainners);
        }

        [HttpGet("getClients")]
        public async Task<ActionResult<IEnumerable<AdminAddedDTO>>> getClients()
        {
            var Clients = context.Clients.FromSqlInterpolated($"SELECT p.Id, p.Name FROM Clients p JOIN Appointments a ON a.ClientId = p.Id GROUP BY a.Id").Select(e => new AdminAddedDTO
            {
                id = e.Id,
                name = e.Name
            })
    .ToList();
            return Ok(Clients);
        }

        [HttpGet("getAdmins")]
        public async Task<ActionResult<IEnumerable<AdminAddedDTO>>> getAdmins()
        {
            var admins = context.Admin.FromSqlInterpolated($"SELECT a.Id, a.Name FROM Admin a JOIN Appointments a2  ON a2.AdminId = a.Id GROUP BY a2.Id").Select(e => new AdminAddedDTO
            {
                id = e.Id,
                name = e.Name
            })
    .ToList();
            return Ok(admins);
        }

        [HttpGet("getappointmentsbydate/{date}")]
        public async Task<IActionResult> getappointmentsbydate(DateOnly date)
        {
            var appointments = await context.Appointments
                .FromSqlInterpolated($"SELECT * FROM Appointments WHERE Date = {date}")
                .Select(a => new AppointmentDTO
                {
                    Id = a.Id,
                    TrainnerId = a.TrainnerId,
                    ClientId = a.ClientId,
                    AdminId = a.AdminId,
                    Date = a.Date,
                    Time = a.Time,
                    Clientcomment = a.clientcomment
                })
                .ToListAsync();

            if (!appointments.Any())
            {
                return NotFound("No appointments found for the specified date.");
            }
            else
            {
                return Ok(appointments);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAppointment(int id)
        {
            var appointment = await appointmentRepository.GetAppointmentsById(id);

            if (appointment == null) return NotFound();

            // Get trainer and client IDs before deleting
            var trainerId = appointment.TrainnerId;
            var clientId = appointment.ClientId;

            var relatedPhotos = await context.ClientsPhotos
           .Where(p => p.ClientId == clientId && p.AppointmentId == appointment.Id)
           .ToListAsync();

            if (relatedPhotos.Any())
            {
                foreach (var photo in relatedPhotos)
                {
                    await photoService.DeletePhotoAsync(photo.publicId); // Make sure this is awaited
                }

                context.ClientsPhotos.RemoveRange(relatedPhotos);
            }
            // Count other appointments between the same trainer and client
            var otherAppointmentsCount = await context.Appointments
                .Where(a => a.TrainnerId == trainerId && a.ClientId == clientId && a.Id != id)
                .CountAsync();

            // Delete the appointment
            appointmentRepository.delete(appointment);

            // If this was the only appointment between trainer and client, delete the relationship
            if (otherAppointmentsCount == 0)
            {
                var clientTrainner = await context.ClientTrainners
                    .FirstOrDefaultAsync(ct => ct.TrainnerId == trainerId && ct.ClientId == clientId);

                if (clientTrainner != null)
                {
                    context.ClientTrainners.Remove(clientTrainner);
                }
            }

            await appointmentRepository.SaveAllAsync();
            return Ok();
        }


        [HttpGet("getschedulesalltrainners")]
        public async Task<ActionResult<IEnumerable<scheduleDTO>>> gettrainnerschedule()
        {
            var schedules = context.Schedules.ToList();
            return Ok(schedules);
        }


        [HttpGet("trainnerschedule/{id}")]
        public async Task<ActionResult<IEnumerable<scheduleDTO>>> GetTrainnerSchedule(int id)
        {
            var schedule = await context.Schedules
            .Where(s => s.TrainnerId == id)
            .Select(s => new scheduleDTO
            {
                DayOfWeek = s.DayOfWeek,
                StartTime = s.StartTime,
                EndTime = s.EndTime
            })
            .ToListAsync();

            if (schedule.Any())
            {
                return Ok(schedule);
            }
            else
            {
                return BadRequest("Cannot find schedule for the trainner");
            }
        }

        [HttpPost("registerappointment")]
        public async Task<ActionResult> RegisterAppointment(
            AppointmentDTO appointmentDTO,
            [FromServices] IHubContext<NotificationHub> hubContext)
        {
            // 1. Check trainer schedule
            var schedule = await context.Schedules
                .FirstOrDefaultAsync(s => s.TrainnerId == appointmentDTO.TrainnerId
                    && s.DayOfWeek == appointmentDTO.Date.DayOfWeek);

            if (schedule == null)
                return BadRequest("Trainer is not scheduled on this day.");

            var appointmentTime = new TimeOnly(appointmentDTO.Time.Hour, appointmentDTO.Time.Minute);

            if (appointmentTime.ToTimeSpan() < schedule.StartTime || appointmentTime.ToTimeSpan() >= schedule.EndTime)
                return BadRequest("Appointment time is outside of the trainer's working hours.");

            // 2. Check class capacity
            var appointmentCount = await context.Appointments
                .Where(s => s.TrainnerId == appointmentDTO.TrainnerId
                            && s.ClassId == appointmentDTO.ClassId
                            && s.Date == appointmentDTO.Date)
                .CountAsync();

            if (appointmentCount >= 5)
                return BadRequest("Class is at full capacity");

            // 3. Map and save appointment
            var newAppointment = mapper.Map<Appointments>(appointmentDTO);
            newAppointment.AdminId = appointmentDTO.AdminId;
            newAppointment.TrainnerId = appointmentDTO.TrainnerId;
            newAppointment.ClientId = appointmentDTO.ClientId;
            newAppointment.clientcase = "";
            newAppointment.clientcomment = "";

            context.Appointments.Add(newAppointment);

            // 4. Add ClientTrainer if not exists
            bool exists = await context.ClientTrainners
                .AnyAsync(ct => ct.ClientId == appointmentDTO.ClientId && ct.TrainnerId == appointmentDTO.TrainnerId);

            if (!exists)
            {
                context.ClientTrainners.Add(new ClientTrainner
                {
                    ClientId = appointmentDTO.ClientId,
                    TrainnerId = appointmentDTO.TrainnerId
                });
            }

            await context.SaveChangesAsync();

// Example: Notify client
            await _notificationService.SendToUser("client", appointmentDTO.ClientId.ToString(), "New appointment booked!");

            // Example: Notify trainer too
            await _notificationService.SendToUser("trainer", appointmentDTO.TrainnerId.ToString(), "You have a new session scheduled!");

            return Ok(new { message = "Appointment created successfully" });

        }



        [HttpGet("getappointment/{id}")]
        public async Task<ActionResult<AppointmentDTO>> getappointment(int id)
        {
            var appointment = await appointmentRepository.GetAppointmentsById(id);

            if (appointment != null)
            {
                return Ok(appointment);
            }

            else
            {
                return BadRequest("cannot find appointment");
            }
        }

        [HttpGet("GetAppointmentsByClient/{idclient}")]
        public async Task<ActionResult<List<AppointmentDTO>>> GetAppointmentsByClient(int idclient)
        {
            var appointments = await context.Appointments
                .FromSqlInterpolated($"SELECT * FROM Appointments WHERE ClientId = {idclient}")
                .Select(a => new AppointmentDTO
                {
                    Id = a.Id,
                    TrainnerId = a.TrainnerId,
                    ClientId = a.ClientId,
                    AdminId = a.AdminId,
                    Date = a.Date,
                    Time = a.Time,
                    ClassId = a.ClassId,
                    Clientcase = a.clientcase,
                    Clientcomment = a.clientcomment
                })
                .ToListAsync(); // 👈 Get a list instead of just the first item

            if (appointments.Any())
            {
                return Ok(appointments); // ✅ return as List<AppointmentDTO>
            }
            else
            {
                return NotFound("No appointments found.");
            }
        }

        [HttpGet("GetAppointmentsByClientedit/{appointmentId}/{clientId}")]
        public async Task<ActionResult<List<AppointmentDTO>>> GetAppointmentsByClientedit(int appointmentId, int ClientID)
        {

            var appointment = await context.Appointments
                .Where(a => a.ClientId == ClientID && a.Id == appointmentId)
                .Select(a => new AppointmentDTO
                {
                    Id = a.Id,
                    TrainnerId = a.TrainnerId,
                    ClientId = a.ClientId,
                    AdminId = a.AdminId,
                    Date = a.Date,
                    Time = a.Time,
                    Clientcase = a.clientcase,
                    ClassId = a.ClassId,
                    Clientcomment = a.clientcomment,
                    hasPhoto = context.ClientsPhotos
                        .Any(p => p.ClientId == a.ClientId && p.AppointmentId == appointmentId),
                    publicId = context.ClientsPhotos
                        .Where(p => p.ClientId == a.ClientId && p.AppointmentId == appointmentId)
                        .Select(p => p.publicId)
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync();

            if (appointment != null)
            {
                return Ok(appointment);
            }
            else
            {
                return BadRequest("Cannot find appointment or you shall not pass");
            }

        }

        [HttpGet("GetAppointmentsByTrainner/{idtrainner}")]
        public async Task<ActionResult<List<AppointmentDTO>>> GetAppointmentsByTrainner(int idtrainner)
        {
            var appointments = await context.Appointments
                .FromSqlInterpolated($"SELECT * FROM Appointments WHERE TrainnerId = {idtrainner}")
                .Select(a => new AppointmentDTO
                {
                    Id = a.Id,
                    TrainnerId = a.TrainnerId,
                    ClientId = a.ClientId,
                    AdminId = a.AdminId,
                    Date = a.Date,
                    Time = a.Time,
                    ClassId = a.ClassId,
                    Clientcase = a.clientcase,
                    Clientcomment = a.clientcomment
                })
                .ToListAsync(); // 👈 Get a list instead of just the first item

            if (appointments.Any())
            {
                return Ok(appointments); // ✅ return as List<AppointmentDTO>
            }
            else
            {
                return NotFound("No appointments found.");
            }
        }

        [HttpGet("getappointmentbytrainneredit/{idappointment}/{idtrainner}")]
        public async Task<ActionResult<AppointmentDTO>> GetAppointmentByTrainner(int idappointment, int idtrainner)
        {
            var appointment = await context.Appointments
                .FromSqlInterpolated($"SELECT * FROM Appointments WHERE TrainnerId = {idtrainner} AND Id = {idappointment}")
                .Select(a => new AppointmentDTO
                {
                    Id = a.Id,
                    TrainnerId = a.TrainnerId,
                    ClientId = a.ClientId,
                    AdminId = a.AdminId,
                    Date = a.Date,
                    Time = a.Time,
                    ClassId = a.ClassId,
                    Clientcase = a.clientcase,
                    Clientcomment = a.clientcomment
                })
                .FirstOrDefaultAsync(); // Execute the query and get the first result or null.

            if (appointment != null)
            {
                return Ok(appointment);
            }
            else
            {
                return BadRequest("Cannot find appointment or you shall not pass");
            }
        }

        [HttpPut]
        public async Task<ActionResult> UpdateAppointmet(AppointmentDTO appointmentDTO)
        {
            var appointment = await appointmentRepository.GetAppointmentsById(appointmentDTO.Id);
            if (appointment == null) return BadRequest("could not find appointment");

            mapper.Map(appointmentDTO, appointment);

            if (await appointmentRepository.SaveAllAsync()) return NoContent();
            return BadRequest("failed to update the appointment");
        }
    }


}



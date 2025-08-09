using api.interfaces;
using API.Controllers;
using API.Data;
using api.DTOS;
using API.interfaces;
using API.Services;
using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using API.entities;
using api.entities;

namespace api.Controllers
{
    public class Trainnercontroller(IPhotoService photoService, DataContext context, ItokenService tokenService, IMapper mapper,
     ITrainnerRepository trainnerRepository) : BaseApiController

    {

        [HttpPost("logintrainner")] //function 3mlt check login w b3tt check for login 
        public async Task<ActionResult<trainnerDTO>> Logintrainner(LoginDTO loginDTo)
        {
            var trainner = await context.Trainners
            .FirstOrDefaultAsync(x => x.Name.ToLower() == loginDTo.Name.ToLower());
            if (trainner == null) return Unauthorized("invalid trainner name");
            using var hmac = new HMACSHA512(trainner.PasswordSalt);
            var computedhash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDTo.Password));
            for (int i = 0; i < computedhash.Length; i++)
            {
                if (computedhash[i] != trainner.PasswordHash[i]) return Unauthorized("invalid password !");
            }

            Console.Error.WriteLine("Login successful, trainer exists: " + trainner.Id);
            return new trainnerDTO
            {
                Id = trainner.Id,
                name = trainner.Name,
                Token = tokenService.CreateTokenTrainner(trainner)
            };

        }


        private async Task<bool> TrainnerExists(string username)
        {
            return await context.Trainners.AnyAsync(x => x.Name.ToLower() == username.ToLower()); //check 3la kol el users
        }

        [HttpPost("trainnerregister")] //acount/register     
        public async Task<ActionResult> Registertrainner(registerTrainnerDTO registerDTo)
        {

            if (await TrainnerExists(registerDTo.trainnername)) return BadRequest("trainner name is taken");

            using var hmac = new HMACSHA512();
            var newtrainner = mapper.Map<Trainners>(registerDTo);

            newtrainner.Name = registerDTo.trainnername;
            newtrainner.DateOfBirth = registerDTo.DateOfBirth;
            newtrainner.AdminId = registerDTo.adminId;
            newtrainner.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes("123456"));
            newtrainner.PasswordSalt = hmac.Key;
            context.Trainners.Add(newtrainner);
            await context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("Getappointments/{id}")]
        public async Task<IActionResult> GetAppointments(int id)
        {
            var appointments = await context.Appointments
                .FromSqlInterpolated($"SELECT * FROM Appointments WHERE trainnerId  =  {id}")
                .Select(a => new AppointmentDTO
                {
                    Id = a.Id,
                    TrainnerId = a.TrainnerId,
                    ClientId = a.ClientId,
                    AdminId = a.AdminId,
                    Date = a.Date,
                    Time = a.Time,
                    Clientcase = a.clientcase

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

        [HttpGet("{id}")]
        public async Task<ActionResult<TrainnerMemberDTO>> Gettrainnerbyid(int id)
        {

            var trainner = await trainnerRepository.GetTrainnerById(id);
            if (trainner != null)
            {
                return Ok(trainner);
            }

            else
            {
                return BadRequest("cannot find trainner");
            }
        }

        [HttpGet("adminaddedthetrainner")]
        public async Task<ActionResult<IEnumerable<AdminAddedDTO>>> adminaddedthetrainner()
        {
            var admins = context.Admin.FromSqlInterpolated
            ($"SELECT a.Id, a.Name FROM Admin a JOIN Trainners d ON d.AdminId = a.Id GROUP BY d.Id").Select(e => new AdminAddedDTO
            {
                id = e.Id,
                name = e.Name
            })
    .ToList();

            return Ok(admins);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTrainner(int id)
        {

            var trainner = await trainnerRepository.GetTrainnerByIdForDelete(id);

            if (trainner == null) return NotFound();

            else
            {
                var clientTrainners = await context.ClientTrainners
                .Where(ct => ct.TrainnerId == id)
                .ToListAsync();

                if (clientTrainners.Any())
                {
                    context.ClientTrainners.RemoveRange(clientTrainners);
                }

                var appointments = await context.Appointments
                    .Where(a => a.TrainnerId == id)
                    .ToListAsync();

                if (appointments.Any())
                {
                    context.Appointments.RemoveRange(appointments);
                }

                var photos = await context.Photos
                    .Where(p => p.TrainnerId == id)
                    .ToListAsync();

                if (photos.Any())
                {
                    foreach (var photo in photos)
                    {
                        await photoService.DeletePhotoAsync(photo.publicId); // Make sure this is awaited
                    }

                    context.Photos.RemoveRange(photos);
                }


                var schedule = await context.Schedules
                    .Where(a => a.TrainnerId == id)
                    .ToListAsync();

                if (schedule.Any())
                {
                    context.Schedules.RemoveRange(schedule);
                }
                trainnerRepository.delete(trainner);

                await trainnerRepository.SaveAllAsync();

                return Ok();
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TrainnerMemberDTO>>> GetTrainners()
        {
            var Trainners = await trainnerRepository.GetTrainnersmemAsync();
            return Ok(Trainners);

        }

        [HttpPut("updateTrainnerschedule/{trainnerId}")]
        public async Task<ActionResult> UpdateTrainnerSchedule(int trainnerId, UpdateTrainerScheduleDTO dto)
        {
            var trainner = await context.Trainners.FindAsync(trainnerId);
            if (trainner == null)
                return NotFound("Trainer not found");

            // Remove old schedule
            var oldSchedules = await context.Schedules
                .Where(s => s.TrainnerId == trainnerId)
                .ToListAsync();

            context.Schedules.RemoveRange(oldSchedules);
            await context.SaveChangesAsync();

            // Add new schedule
            foreach (var item in dto.Schedule)
            {
                if (!TimeSpan.TryParse(item.StartTime, out var startTime) ||
                    !TimeSpan.TryParse(item.EndTime, out var endTime))
                {
                    return BadRequest($"Invalid time format for day {item.Day}.");
                }

                context.Schedules.Add(new Schedule
                {
                    TrainnerId = trainnerId,
                    DayOfWeek = (DayOfWeek)item.Day,
                    StartTime = startTime,
                    EndTime = endTime
                });
            }

            // Update trainer-class relation (many-to-many)
            var existingRelations = context.TrainnerClasses
                .Where(tc => tc.TrainnerId == trainnerId);
            context.TrainnerClasses.RemoveRange(existingRelations);

            foreach (var classId in dto.ClassIds)
            {
                context.TrainnerClasses.Add(new TrainnerClass
                {
                    TrainnerId = trainnerId,
                    ClassId = classId
                });
            }

            await context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult> UpdateTrainner(TrainnerMemberDTO trainnerMemberDTO)
        {
            var trainner = await context.Trainners.FindAsync(trainnerMemberDTO.Id);
            if (trainner == null) return BadRequest("could not find trainner");

            var edittedtrainner = new TrainnerMemberUpdateDTO
            {
                id = trainnerMemberDTO.Id,
                name = trainnerMemberDTO.Name,
                dateOfBirth = trainnerMemberDTO.DateOfBirth,
                adminId = trainnerMemberDTO.AdminId,
                trainnerprice = trainnerMemberDTO.TrainnerPrice
            };

            if (!string.IsNullOrWhiteSpace(trainnerMemberDTO.Password))
            {
                using var hmac = new HMACSHA512();
                edittedtrainner.passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(trainnerMemberDTO.Password));
                edittedtrainner.passwordSalt = hmac.Key;
            }
            else
            {
                edittedtrainner.passwordHash = trainner.PasswordHash;
                edittedtrainner.passwordSalt = trainner.PasswordSalt;
            }


            mapper.Map(edittedtrainner, trainner);

            if (await trainnerRepository.SaveAllAsync()) return NoContent();
            return BadRequest("failed to update the trainner");

        }

    }

}


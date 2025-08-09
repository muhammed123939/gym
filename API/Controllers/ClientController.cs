using System.Security.Cryptography;
using System.Text;
using api.Data;
using api.DTOS;
using api.entities;
using api.interfaces;
using API.Data;
using API.entities;
using API.interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Mail;
using api.Services;

namespace API.Controllers
{
    public class ClientController(EmailService emailService, DataContext context, ItokenService tokenService, IMapper mapper,
     IClientRepository clientRepository , IPhotoService photoService ) : BaseApiController
    {

        [HttpGet("appointmentsbyclient/{trainnerId}")]
        public async Task<ActionResult<IEnumerable<AdminAddedDTO>>> appointmentsbyclient(int trainnerId)
        {
            var clients = context.Clients.FromSqlInterpolated
            ($"SELECT p.Id, p.Name FROM Clients p JOIN Appointments a ON a.ClientId = p.Id WHERE a.TrainnerId = {trainnerId}").Select(e => new AdminAddedDTO
            {
                id = e.Id,
                name = e.Name
            }).ToList();

            return Ok(clients);
        }

        [HttpGet("adminaddedtheClient")]
        public async Task<ActionResult<IEnumerable<AdminAddedDTO>>> adminaddedtheclient()
        {
            var admins = context.Admin.FromSqlInterpolated
            ($"SELECT a.Id, a.Name FROM Admin a JOIN Clients p  ON p.AdminId = a.Id GROUP BY p.Id").Select(e => new AdminAddedDTO
            {
                id = e.Id,
                name = e.Name
            })
            .ToList();

            return Ok(admins);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(ClientDTO clientMemberDTO)
        {
            var client = await clientRepository.GetClientById(clientMemberDTO.id);
            if (client == null) return BadRequest("could not find client");
            var edittedclient = new ClientMemberUpdateDTO();

            using var hmac = new HMACSHA512();
            edittedclient.id = clientMemberDTO.id;
            edittedclient.name = clientMemberDTO.name;
            edittedclient.age = clientMemberDTO.age;
            edittedclient.gender = clientMemberDTO.gender;
            edittedclient.mobileNumber = clientMemberDTO.mobileNumber;
            edittedclient.dateOfBirth = clientMemberDTO.dateOfBirth;
            edittedclient.adminId = clientMemberDTO.adminId;
            edittedclient.nationalNumber = clientMemberDTO.nationalNumber;

            if (!string.IsNullOrWhiteSpace(clientMemberDTO.password))
            {
                edittedclient.passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(clientMemberDTO.password));
                edittedclient.passwordSalt = hmac.Key;
            }

            else
            {
                edittedclient.passwordHash = client.PasswordHash;
                edittedclient.passwordSalt = client.PasswordSalt;
            }


            mapper.Map(edittedclient, client);
            var saveResult = await clientRepository.SaveAllAsync();
            if (saveResult)
            {
                return NoContent();
            }
            else
            {
                Console.WriteLine("Save operation failed");
                return BadRequest("failed to update the client");
            }

        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientDTO>>> Getclients()
        {
            return await context.Clients.ProjectTo<ClientDTO>(mapper.ConfigurationProvider).ToListAsync();
        }

        [HttpGet("getclientstrainner/{id}")]
        public async Task<ActionResult<IEnumerable<ClientDTO>>> GetclientsOfTrainner(int id)
        {
            var clients = await context.ClientTrainners
                .Where(ct => ct.TrainnerId == id)
                .Include(ct => ct.Client)
                .Select(ct => new ClientDTO
                {
                    id = ct.Client.Id,
                    name = ct.Client.Name,
                    age = ct.Client.Age,
                    mobileNumber = ct.Client.MobileNumber,
                    gender = ct.Client.Gender,
                    hasPhoto = context.ClientsPhotos.Any(p => p.ClientId == ct.Client.Id),
                    publicId = context.ClientsPhotos
                        .Where(p => p.ClientId == ct.Client.Id)
                        .Select(p => p.publicId)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(clients);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ClientDTO>>> SearchClients([FromQuery] string term)
        {
            if (term == "all")
            {
                return await context.Clients
                    .ProjectTo<ClientDTO>(mapper.ConfigurationProvider)
                    .ToListAsync();
            }

            if (string.IsNullOrWhiteSpace(term) || term.Length == 1)
            {
                return Ok();
            }

            else
            {
                term = term.ToLower();
                return await context.Clients
                    .Where(p => p.NationalNumber.ToLower().Contains(term) || p.Name.ToLower().Contains(term) || p.MobileNumber.ToLower().Contains(term))
                    .ProjectTo<ClientDTO>(mapper.ConfigurationProvider)
                    .ToListAsync();
            }
        }

        [HttpGet("client/{id}")]

        public async Task<ActionResult<ClientDTO>> Getclientbyid(int id)
        {
            var client = await clientRepository.GetClientById(id);
            if (client != null)
            {
                return Ok(client);
            }
            else
            {
                return BadRequest("cannot find client");
            }
        }


        [HttpDelete("deletephoto/{id}")]
        public async Task<ActionResult> deletePhoto(int id)
        {

            var client = await clientRepository.GetClientById(id);

            if (client == null) return NotFound();

            else
            {
                
             var relatedPhotos = await context.ClientsPhotos
           .Where(p => p.ClientId == id )
           .ToListAsync();

                if (relatedPhotos.Any())
                {
                    foreach (var photo in relatedPhotos)
                    {
                        await photoService.DeletePhotoAsync(photo.publicId); // Make sure this is awaited
                    }

                    context.ClientsPhotos.RemoveRange(relatedPhotos);
                }

                await clientRepository.SaveAllAsync();
                return Ok();
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteClient(int id)
        {

            var client = await clientRepository.GetClientById(id);

            if (client == null) return NotFound();

            else
            {

             var relatedPhotos = await context.ClientsPhotos
           .Where(p => p.ClientId == id )
           .ToListAsync();

                if (relatedPhotos.Any())
                {
                    foreach (var photo in relatedPhotos)
                    {
                        await photoService.DeletePhotoAsync(photo.publicId); // Make sure this is awaited
                    }

                    context.ClientsPhotos.RemoveRange(relatedPhotos);
                }

                clientRepository.delete(client);
                await clientRepository.SaveAllAsync();
                return Ok();
            }
        }


        [HttpPost("offer")]
        public async Task<ActionResult> SendOfferToVerifiedClients([FromBody] string offer)
        {
            if (string.IsNullOrWhiteSpace(offer)) return BadRequest("Offer cannot be empty.");

            // Get all verified clients with email
            var verifiedClients = await context.Clients
                .Where(c => c.EmailConfirmed && !string.IsNullOrEmpty(c.Email))
                .ToListAsync();

            if (!verifiedClients.Any()) return NotFound("No verified clients with email found.");

            foreach (var client in verifiedClients)
            {
                // You should have an email service here
                await emailService.SendEmailAsync(client.Email, "New Offer for You!", offer);
            }

            return Ok("Offer sent to all verified clients.");
        }

        [HttpPost("login")] //function 3mlt check login w b3tt check for login 
        public async Task<ActionResult<ClientLoginDTO>> Loginclient(LoginDTO loginDTo)
        {
            var client = await context.Clients
            .FirstOrDefaultAsync(x => x.Name.ToLower() == loginDTo.Name.ToLower());
            if (client == null) return Unauthorized("invalid client name");
            using var hmac = new HMACSHA512(client.PasswordSalt);
            var computedhash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDTo.Password));
            for (int i = 0; i < computedhash.Length; i++)
            {
                if (computedhash[i] != client.PasswordHash[i]) return Unauthorized("invalid password !");
            }
            return new ClientLoginDTO
            {
                Id = client.Id,
                name = client.Name,
                Token = tokenService.CreateTokenClient(client)
            };
        }

        [HttpPost("clientregister")]
        public async Task<ActionResult> Registerclient(RegisterClientDTO registerDTo)
        {
            if (await MobileExists(registerDTo.mobile)) return BadRequest("mobile number taken");
            if (await nationanumExists(registerDTo.nationalNumber)) return BadRequest("national number taken");
            if (await emailExist(registerDTo.email)) return BadRequest("email taken");

            var newclient = mapper.Map<Clients>(registerDTo);
            using var hmac = new HMACSHA512();

            newclient.Name = registerDTo.name;
            newclient.Gender = registerDTo.gender;
            newclient.MobileNumber = registerDTo.mobile;
            newclient.DateOfBirth = registerDTo.DateOfBirth;
            newclient.NationalNumber = registerDTo.nationalNumber;
            newclient.AdminId = registerDTo.adminId;
            newclient.Email = registerDTo.email;
            newclient.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes("123456"));
            newclient.PasswordSalt = hmac.Key;

            context.Clients.Add(newclient);
            await context.SaveChangesAsync();

            // ✅ 1. Generate the token
            var token = Guid.NewGuid().ToString();

            // ✅ 2. Create token entry
            var emailToken = new EmailToken
            {
                ClientId = newclient.Id,
                Token = token,
                ExpiryDate = DateTime.UtcNow.AddHours(24) // expires in 24h
            };
            context.Add(emailToken);
            await context.SaveChangesAsync();

            // Redirect to Angular to call the backend API
            var link = $"http://localhost:4200/verify-email?token={token}";


            // ✅ 4. Send email
            await emailService.SendEmailAsync(
                newclient.Email,
                "Welcome to GYM App - Verify Your Email",
                $"<h3>Welcome {newclient.Name}!</h3><p>Click <a href='{link}'>here</a> to verify your email.</p>"
            );

            return Ok(new { message = "Registration successful. Check your email to verify your account." });

        }

        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail(string token)
        {
            var tokenEntry = await context.EmailTokens.FirstOrDefaultAsync(x => x.Token == token);

            if (tokenEntry == null || tokenEntry.ExpiryDate < DateTime.UtcNow)
                return BadRequest("Invalid or expired token.");

            var client = await context.Clients.FindAsync(tokenEntry.ClientId);
            if (client == null) return NotFound();

            client.EmailConfirmed = true;
            context.EmailTokens.Remove(tokenEntry); // delete token after use
            await context.SaveChangesAsync();

            return Ok("Email verified successfully!");
        }

        private async Task<bool> emailExist(string email)
        {
            return await context.Clients.AnyAsync(x => x.Email == email);
        }

        private async Task<bool> MobileExists(string mobile)
        {
            return await context.Clients.AnyAsync(x => x.MobileNumber == mobile);
        }

        private async Task<bool> nationanumExists(string nationalnumber)
        {
            return await context.Clients.AnyAsync(x => x.NationalNumber == nationalnumber);
        }

    }
}

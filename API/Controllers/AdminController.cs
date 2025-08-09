using System.Security.Cryptography;
using System.Text;
using api.DTOS;
using API.Data;
using API.entities;
using API.interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AdminController(DataContext context, ItokenService tokenService, IMapper mapper, IAdminRepository adminRepository) : BaseApiController
    {
        private async Task<bool> UserExists(string username)
        {
            return await context.Admin.AnyAsync(x => x.Name.ToLower() == username.ToLower()); //check 3la kol el users
        }


        [HttpPost("loginadmin")] //function 3mlt check login w b3tt check for login 
        public async Task<ActionResult<AdminDTO>> Login(LoginDTO loginDTo)
        {
            var admin = await context.Admin
            .FirstOrDefaultAsync(x => x.Name.ToLower() == loginDTo.Name.ToLower());//get first username exist
            if (admin == null) return Unauthorized("invalid username");
            using var hmac = new HMACSHA512(admin.PasswordSalt);//5at salt mn database
            var computedhash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDTo.Password));//compute hash elsalt m3 elpassword entered
            for (int i = 0; i < computedhash.Length; i++)
            {
                if (computedhash[i] != admin.PasswordHash[i]) return Unauthorized("invalid password !");//karen password hash in db m3 computed hash
            }
            return new AdminDTO
            {
                Id = admin.Id,
                Cando = admin.CanDo,
                Username = admin.Name,
                Token = tokenService.CreateToken(admin),
            };
        }


    [HttpPost("registeradmin")] 
    public async Task<ActionResult<AdminDTO>> Register(RegisterDTO registerDTo)
    {
        if (await UserExists(registerDTo.adminname)) return BadRequest("username is taken");
        using var hmac = new HMACSHA512();
        var newadmin = mapper.Map<Admins>(registerDTo);
        newadmin.Name = registerDTo.adminname;
        newadmin.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDTo.adminpassword));
        newadmin.PasswordSalt = hmac.Key;
        newadmin.CanDo=registerDTo.cando;
       
        context.Admin.Add(newadmin);
        await context.SaveChangesAsync();
        return Ok(newadmin);
    }


        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAdmin(int id)
        {

            var admin = await adminRepository.GetAdminById(id);

            if (admin == null) return NotFound();

            else
            {
                adminRepository.delete(admin);
                await adminRepository.SaveAllAsync();
                return Ok();
            }
        }

        [HttpGet("getadmins")]
        public async Task<ActionResult<IEnumerable<AdminMemberDTO>>> GetAdmins()
        {
            var admins = await adminRepository.GetAdminsmemAsync();
            return Ok(admins);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AdminMemberDTO>> Getuserbyid(int id)
        {
            var admin = await adminRepository.GetAdminById(id);
            if (admin != null)
            {
                return Ok(admin);
            }
            else
            {
                return BadRequest("cannot find admin");
            }
        }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(AdminMemberDTO adminmemberDTO)
        {
            var edittedadmin = new AdminMemberUpdateDTO();
            var admin = await adminRepository.GetAdminById(adminmemberDTO.id);
            if (admin == null) return BadRequest("could not find admin");

            using var hmac = new HMACSHA512();
            edittedadmin.id = adminmemberDTO.id;
            edittedadmin.canDo = adminmemberDTO.canDo;
            edittedadmin.name = adminmemberDTO.name;

            if (!string.IsNullOrWhiteSpace(adminmemberDTO.password))
            {
                edittedadmin.passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(adminmemberDTO.password));
                edittedadmin.passwordSalt = hmac.Key;
            }

            else
            {
                edittedadmin.passwordHash = admin.PasswordHash;
                edittedadmin.passwordSalt = admin.PasswordSalt;
            }

            mapper.Map(edittedadmin, admin);
            if (await adminRepository.SaveAllAsync()) return NoContent();
            return BadRequest("failed to update the admin");
        }
    }
}

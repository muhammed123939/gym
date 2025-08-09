using api.DTOS;
using api.entities;
using API.Controllers;
using API.Data;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    public class ClassesController(DataContext context, IMapper mapper) : BaseApiController
    {
        private async Task<bool> ClassExists(string classname)
        {
            return await context.Classes.AnyAsync(x => x.Name.ToLower() == classname.ToLower()); //check 3la kol el users
        }

        [HttpPost("add")]
        public async Task<ActionResult> AddClass(ClassesDTO classDTO)
        {
            if (await ClassExists(classDTO.Name)) return BadRequest("class is Exist");

            var newClass = mapper.Map<Classes>(classDTO);
            newClass.Name = classDTO.Name;
            context.Classes.Add(newClass);
            await SaveAllAsync();
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteClass(int id)
        {

            var classs = await GetClassbyid(id);
            if (classs == null) return NotFound();

            else
            {
                context.Classes.Remove(classs);
                await SaveAllAsync();
                return Ok();
            }
        }

        [HttpPut]
        public async Task<ActionResult> UpdateGroup(ClassesDTO classesDTO)
        {

            var classs = await GetClassbyid(classesDTO.Id);
            if (classs == null) return BadRequest("could not find class");

            mapper.Map(classesDTO, classs);

            if (await SaveAllAsync()) return NoContent();
            return BadRequest("failed to update the class");
        }

        public async Task<bool> SaveAllAsync()
        {
            return await context.SaveChangesAsync() > 0;
        }

        [HttpGet("getTrainnerclass/{id}")]
        public async Task<ActionResult<IEnumerable<ClassesDTO>>> GetTrainnerClasses(int id)
        {
            var classes = await context.TrainnerClasses
                .Where(tc => tc.TrainnerId == id)
                .Select(tc => new ClassesDTO
                {
                    Id = tc.Class.Id,
                    Name = tc.Class.Name
                })
                .ToListAsync();

            return Ok(classes);
        }


        [HttpGet("getclass/{id}")]
        public async Task<Classes?> GetClassbyid(int id)
        {
            return await context.Classes.FindAsync(id);
        }

        [HttpGet("getall")]
        public async Task<IEnumerable<ClassesDTO>> GetClasses()
        {
            return await context.Classes
         .ProjectTo<ClassesDTO>(mapper.ConfigurationProvider)
         .ToListAsync();
        }

    }
}

using api.DTOS;
using api.interfaces;
using API.Controllers;
using API.Data;
using API.interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.entities;
using api.entities;


namespace api.Controllers
{


     public class PhotoController( ITrainnerRepository trainnerRepository ,  IPhotoService photoService ,  DataContext context,  IMapper mapper) : BaseApiController

    {
 
        [HttpGet("GetTrainnersphotos")]
        public async Task<ActionResult<IEnumerable<photoDTO>>> GetTrainnersphotos()
        {
            var photos = context.Photos.FromSqlInterpolated
            ($"SELECT Id , Url from Photos p GROUP BY TrainnerId").Select(e => new photoDTO
            {
                Id = e.Id,
                Url = e.Url
            })
    .ToList();

            return Ok(photos);
        }

        [HttpPost("add-clientphoto/{appointmentid}/{clientId}/{trainnerId}")]

        public async Task<ActionResult> clientphoto(IFormFile file, int appointmentid ,
        int clientId, int trainnerId) 
        {

            var oldphoto = await context.ClientsPhotos.FirstOrDefaultAsync(clientphoto => clientphoto.AppointmentId == appointmentid);

            if (oldphoto != null)
            {
                var resultofdeletioncloud = await photoService.DeletePhotoAsync(oldphoto.publicId);
                if (resultofdeletioncloud.Error != null) return BadRequest(resultofdeletioncloud.Error.Message);
                context.ClientsPhotos.Remove(oldphoto);
                await trainnerRepository.SaveAllAsync();
            }

            var resultupload = await photoService.AddPhotoAsync(file);
            if (resultupload.Error != null) return BadRequest(resultupload.Error.Message);

            var newPhoto = new ClientsPhotos
            {
                Url = resultupload.SecureUrl.AbsoluteUri,
                publicId = resultupload.PublicId,
                AppointmentId = appointmentid,
                ClientId = clientId ,
                TrainnersId = trainnerId 
            };

            context.ClientsPhotos.Add(newPhoto);
            await context.SaveChangesAsync();
            return Ok("New photo Added");
        }

        [HttpPost("add-photo/{trainnerId}")]

        public async Task<ActionResult> AddPhoto(IFormFile file, int trainnerId)
        {

            var oldphoto = await context.Photos.FirstOrDefaultAsync(photo => photo.TrainnerId == trainnerId);

            if (oldphoto != null)
            {
                var resultofdeletioncloud = await photoService.DeletePhotoAsync(oldphoto.publicId);
                if (resultofdeletioncloud.Error != null) return BadRequest(resultofdeletioncloud.Error.Message);
                context.Photos.Remove(oldphoto);
                await trainnerRepository.SaveAllAsync();
            }

            var resultupload = await photoService.AddPhotoAsync(file);
            if (resultupload.Error != null) return BadRequest(resultupload.Error.Message);

            var newPhoto = new Photos
            {
                Url = resultupload.SecureUrl.AbsoluteUri,
                publicId = resultupload.PublicId,
                TrainnerId = trainnerId
            };

            context.Photos.Add(newPhoto);
            await context.SaveChangesAsync();
            return Ok("New photo Added");
        }

        [HttpGet("Gettrainnerphoto/{trainnerId}")]
        public async Task<ActionResult<photoDTO>> Gettrainnerphoto(int trainnerId)
        {
            var photo = context.Photos.FromSqlInterpolated
            ($"SELECT Id , Url FROM Photos WHERE TrainnerId ={trainnerId}").Select(e => new photoDTO
            {
                Id = e.Id,
                Url = e.Url
            });

            return Ok(photo);
        }


    }
}

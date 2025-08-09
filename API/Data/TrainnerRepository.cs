using System;
using api.DTOS;
using api.entities;
using api.interfaces;
using API.Data;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace api.Data;

public class TrainnerRepository (DataContext context, IMapper mapper) : ITrainnerRepository
{
    public void delete(Trainners Trainner)
    {
        context.Trainners.Remove(Trainner) ;
    }
 
public async Task<TrainnerMemberDTO?> GetTrainnerById(int id)
{
    return await context.Trainners
        .Include(t => t.TrainnerClasses)
        .Where(t => t.Id == id)
        .Select(t => new TrainnerMemberDTO
        {
            Id = t.Id,
            Name = t.Name,
            DateOfBirth = t.DateOfBirth,
            Age = t.Age,
            AdminId = t.AdminId,
            TrainnerPrice = t.TrainnerPrice,
            ClassIds = t.TrainnerClasses.Select(tc => tc.ClassId).ToList()
        })
        .FirstOrDefaultAsync();
}

    public async Task<Trainners?> GetTrainnerByIdForDelete(int id)
    {
         return await context.Trainners.FindAsync(id);
    }

    public async Task<IEnumerable<TrainnerMemberDTO>> GetTrainnersmemAsync()
    {
        return await context.Trainners
        .ProjectTo<TrainnerMemberDTO>(mapper.ConfigurationProvider)
        .ToListAsync();
    }

    public async Task<bool> SaveAllAsync()
    {
        return await context.SaveChangesAsync() > 0;
    }
}

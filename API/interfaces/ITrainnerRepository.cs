using System;
using api.DTOS;
using api.entities;

namespace api.interfaces;

public interface ITrainnerRepository
{
    void delete (Trainners Trainner);
    Task<TrainnerMemberDTO?> GetTrainnerById(int id);
    Task<Trainners?> GetTrainnerByIdForDelete(int id);
    Task<bool> SaveAllAsync();
    Task<IEnumerable<TrainnerMemberDTO>> GetTrainnersmemAsync();
}

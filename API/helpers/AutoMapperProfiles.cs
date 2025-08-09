using System;
using api.Data;
using api.DTOS;
using api.entities;
using API.entities;
using AutoMapper;

namespace API.helpers;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {

        CreateMap<Appointments, AppointmentDTO>();
        CreateMap<AppointmentDTO, Appointments>();
        
        CreateMap<Admins, AdminMemberDTO>();
        CreateMap<RegisterDTO, Admins>();
        CreateMap<AdminMemberUpdateDTO, Admins>();

        CreateMap<ClassesDTO, Classes>();
        CreateMap<Classes, ClassesDTO>();

        CreateMap<ClientMemberUpdateDTO, Clients>();
        CreateMap<RegisterClientDTO, Clients>();
        CreateMap<Clients, ClientDTO>();

        CreateMap<TrainnerMemberUpdateDTO, Trainners>()
        .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        CreateMap<Trainners, TrainnerMemberUpdateDTO>();
        CreateMap<registerTrainnerDTO, Trainners>();
        CreateMap<Trainners,TrainnerMemberDTO>();
        CreateMap<TrainnerMemberDTO, TrainnerMemberUpdateDTO>().ReverseMap();
        CreateMap<Trainners, trainnerDTO>();
        CreateMap<AdminAddedDTO, Trainners>();
    }
    
}

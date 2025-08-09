using api.entities;
using API.entities;

namespace API.interfaces;

public interface ItokenService
{
 string CreateToken (Admins admin);
string CreateTokenTrainner(Trainners trainner);
string CreateTokenClient (Clients client);
 
}

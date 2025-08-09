using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using api.entities;
using API.entities;
using API.interfaces;
using Microsoft.IdentityModel.Tokens;

namespace API.Services;

public class TokenService (IConfiguration config): ItokenService
{
    
    public string CreateTokenClient(Clients client)
    {

        var tokenkey = config["TokenKey"] ?? throw new Exception("cannot access tokenkey from appsetting");
        if (tokenkey.Length < 64) throw new Exception("your tokenkey needs to be longer ");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenkey));
        var claims = new List<Claim>
        {
            new (ClaimTypes.NameIdentifier , client.Name)
        };
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = creds
        };
        var tokenhandler = new JwtSecurityTokenHandler();
        var token = tokenhandler.CreateToken(tokenDescriptor);
        return tokenhandler.WriteToken(token);

    }
    
    public string CreateToken(Admins admin)
    {

        var tokenkey = config["TokenKey"] ?? throw new Exception("cannot access tokenkey from appsetting");
        if (tokenkey.Length < 64) throw new Exception("your tokenkey needs to be longer ");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenkey));
        var claims = new List<Claim>
        {
            new (ClaimTypes.NameIdentifier , admin.Name)
        };
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = creds
        };
        var tokenhandler = new JwtSecurityTokenHandler();
        var token = tokenhandler.CreateToken(tokenDescriptor);
        return tokenhandler.WriteToken(token);

    }
    
    public string CreateTokenTrainner(Trainners trainner)
    {

        var tokenkey = config["TokenKey"] ?? throw new Exception("cannot access tokenkey from appsetting");
        if (tokenkey.Length < 64) throw new Exception("your tokenkey needs to be longer ");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenkey));
        var claims = new List<Claim>
        {
            new (ClaimTypes.NameIdentifier , trainner.Name)
        };
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = creds
        };
        var tokenhandler = new JwtSecurityTokenHandler();
        var token = tokenhandler.CreateToken(tokenDescriptor);
        return tokenhandler.WriteToken(token);

    }
}

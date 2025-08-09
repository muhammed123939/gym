using System.Text.RegularExpressions;
using api.entities;
using API.entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class DataContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<TrainnerClass> TrainnerClasses { get; set; }

    public DbSet<Admins> Admin { get; set; }
    public DbSet<EmailToken> EmailTokens { get; set; }

    public DbSet<Trainners> Trainners { get; set; }
    public DbSet<Clients> Clients { get; set; }
    public DbSet<Schedule> Schedules { get; set; }
    public DbSet<Classes> Classes { get; set; }
    public DbSet<Photos> Photos { get; set; }
    public DbSet<Appointments> Appointments { get; set; }
    public DbSet<ClientTrainner> ClientTrainners { get; set; }
    public DbSet<ClientsPhotos> ClientsPhotos { get; set; } 
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

        modelBuilder.Entity<Trainners>()
            .HasOne(t => t.Admins)
            .WithMany(a => a.Trainners);

        modelBuilder.Entity<TrainnerClass>()
            .HasKey(tc => new { tc.TrainnerId, tc.ClassId });

        modelBuilder.Entity<TrainnerClass>()
            .HasOne(tc => tc.Trainner)
            .WithMany(t => t.TrainnerClasses)
            .HasForeignKey(tc => tc.TrainnerId);

        modelBuilder.Entity<TrainnerClass>()
            .HasOne(tc => tc.Class)
            .WithMany(c => c.TrainnerClasses)
            .HasForeignKey(tc => tc.ClassId);

        modelBuilder.Entity<Clients>()
            .HasMany(c => c.Classes)
            .WithMany(c => c.Clients);

        modelBuilder.Entity<Schedule>()
             .HasOne(s => s.Trainners)
             .WithMany(t => t.Schedules)
             .HasForeignKey(s => s.TrainnerId);

        modelBuilder.Entity<Clients>()
            .HasOne(c => c.Admins)
            .WithMany(a => a.Clients);

        modelBuilder.Entity<Trainners>()
            .HasOne(t => t.Photos)
            .WithOne(p => p.Trainners);

        modelBuilder.Entity<Clients>()
        .HasMany(c => c.ClientsPhotos)
        .WithOne(p => p.Clients)
        .HasForeignKey(p => p.ClientId);

        modelBuilder.Entity<Trainners>()
       .HasMany(t => t.Appointments)
       .WithOne(a => a.Trainners);

        modelBuilder.Entity<Admins>()
       .HasMany(a => a.Appointments)
       .WithOne(a => a.Admins);

        modelBuilder.Entity<Clients>()
       .HasMany(c => c.Appointments)
       .WithOne(a => a.Clients);


        modelBuilder.Entity<ClientTrainner>()
            .HasKey(ct => new { ct.ClientId, ct.TrainnerId });

        modelBuilder.Entity<ClientTrainner>()
        .HasOne(ct => ct.Client)
        .WithMany(c => c.ClientTrainners)
        .HasForeignKey(ct => ct.ClientId);

        modelBuilder.Entity<ClientTrainner>()
        .HasOne(ct => ct.Trainner)
        .WithMany(t => t.ClientTrainners)
        .HasForeignKey(ct => ct.TrainnerId);

    //     modelBuilder.Entity<Clients>()
    //     .HasMany(c => c.Trainners)
    //    .WithMany(t => t.Clients);

        base.OnModelCreating(modelBuilder);
    }
}

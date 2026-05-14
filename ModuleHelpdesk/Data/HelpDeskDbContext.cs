using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using ModuleHelpDesk.Models;
using System.Text.Json;
using System.Linq;

namespace ModuleHelpDesk.Data
{
    public class HelpDeskDbContext : DbContext
    {
        public HelpDeskDbContext(DbContextOptions<HelpDeskDbContext> options)
            : base(options)
        {
        }

        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<Intervention> Interventions { get; set; }
        public DbSet<TicketCollaborateur> TicketCollaborateurs { get; set; }
        public DbSet<MessageTicket> MessageTickets { get; set; }
        public DbSet<KnowledgeBase> KnowledgeBases { get; set; }
        public DbSet<KnowledgeSolution> KnowledgeSolutions { get; set; }
        public DbSet<Agent> Agents { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<Contact> Contacts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // --- 1. CONFIGURATION DES COMPARATEURS DE LISTES (RÉSOUD LES WARNINGS 10620) ---
            var stringListComparer = new ValueComparer<List<string>>(
                (c1, c2) => c1!.SequenceEqual(c2!),
                c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                c => c.ToList());

            // --- 2. CONFIGURATION DES DÉCIMAUX (RÉSOUD LES WARNINGS 30000) ---
            modelBuilder.Entity<Agent>(entity => {
                entity.Property(a => a.CoutHoraire).HasColumnType("decimal(18,2)");
                entity.Property(a => a.Rating).HasColumnType("decimal(3,2)");
                entity.Property(a => a.Id).ValueGeneratedNever(); // Ton choix pour RabbitMQ
            });

            modelBuilder.Entity<Company>(entity => {
                entity.Property(c => c.MaxHeuresTraitementTicket).HasColumnType("decimal(18,2)");
            });

            // --- 3. CONVERSIONS JSON & COMPARER ---
            modelBuilder.Entity<Ticket>(entity => {
                entity.Property(t => t.ImagesUrls)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null!),
                        v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null!) ?? new List<string>()
                    )
                    .Metadata.SetValueComparer(stringListComparer);
            });

            modelBuilder.Entity<KnowledgeSolution>(entity => {
                entity.Property(s => s.PiecesJointesUrls)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null!),
                        v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null!) ?? new List<string>()
                    )
                    .Metadata.SetValueComparer(stringListComparer);

                // Relation KnowledgeBase <-> Solution
                entity.HasOne<KnowledgeBase>()
                      .WithMany(k => k.Solutions)
                      .HasForeignKey(s => s.KnowledgeBaseId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // --- 4. RELATIONS ET CLÉS ---
            modelBuilder.Entity<MessageTicket>(entity =>
            {
                entity.HasOne(m => m.Ticket)
                      .WithMany(t => t.Messages)
                      .HasForeignKey(m => m.TicketId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
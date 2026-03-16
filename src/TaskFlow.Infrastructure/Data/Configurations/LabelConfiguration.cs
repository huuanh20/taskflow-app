using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskFlow.Domain.Entities;

namespace TaskFlow.Infrastructure.Data.Configurations;

public class LabelConfiguration : IEntityTypeConfiguration<Label>
{
    public void Configure(EntityTypeBuilder<Label> builder)
    {
        builder.HasKey(l => l.Id);

        builder.Property(l => l.Name)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(l => l.Name)
            .IsUnique();

        builder.Property(l => l.Color)
            .IsRequired()
            .HasMaxLength(7)
            .HasDefaultValue("#6366f1");
    }
}

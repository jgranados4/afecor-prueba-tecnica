namespace ApiRest.DTOs
{
    public class ClienteDto
    {
        public int ClienteId { get; set; }

        public string Nombre { get; set; } = null!;

        public string? Direccion { get; set; }

        public string? Telefono { get; set; }

        public string? Email { get; set; }
    }
}

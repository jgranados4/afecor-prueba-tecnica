namespace ApiRest.DTOs
{
    public class ProductoDto
    {
        public int ProductoId { get; set; }

        public string Nombre { get; set; } = null!;

        public decimal Costo { get; set; }

        public decimal PrecioVenta { get; set; }
    }
}

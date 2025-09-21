namespace ApiRest.DTOs
{
    public class PedidoDetalleDto
    {
        public string ProductoNombre { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Rentabilidad { get; set; }
    }
}

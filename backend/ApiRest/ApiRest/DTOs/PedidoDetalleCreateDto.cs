namespace ApiRest.DTOs
{
    public class PedidoDetalleCreateDto
    {
        public int ProductoId { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Rentabilidad { get; set; }   
    }
}

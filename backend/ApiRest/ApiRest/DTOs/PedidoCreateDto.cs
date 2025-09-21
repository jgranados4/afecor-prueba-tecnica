namespace ApiRest.DTOs
{
    public class PedidoCreateDto
    {
        public int ClienteId { get; set; }
        public DateOnly FechaPedido { get; set; }
        public decimal? Total { get; set; }
        public List<PedidoDetalleCreateDto> Detalles { get; set; } = new();
    }
}

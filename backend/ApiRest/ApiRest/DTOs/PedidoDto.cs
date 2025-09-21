namespace ApiRest.DTOs
{
    public class PedidoDto
    {
     
        public int PedidoId { get; set; }
        public string ClienteNombre { get; set; }
        public DateOnly FechaPedido { get; set; }
        public decimal? Total { get; set; }
        public List<PedidoDetalleDto> Detalles { get; set; }
    }
}

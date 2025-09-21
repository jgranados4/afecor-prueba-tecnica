using ApiRest.DTOs;
using ApiRest.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiRest.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PedidosController : ControllerBase
    {
        private readonly AfecordbContext _context;
        public PedidosController(AfecordbContext context)
        {
            _context=context;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<PedidoDto>>> GetPedidos()
        {
            var pedidos = await _context.Pedidos
       .Include(p => p.Cliente)
       .Include(p => p.PedidoDetalles)
       .ThenInclude(pd => pd.Producto)
       .Select(p => new PedidoDto
       {
           PedidoId=p.PedidoId,
           ClienteNombre = p.Cliente.Nombre,
           FechaPedido = p.FechaPedido,
           Total = p.Total,
           Detalles = p.PedidoDetalles.Select(pd => new PedidoDetalleDto
           {
               ProductoNombre = pd.Producto.Nombre,
               Cantidad = pd.Cantidad,
               PrecioUnitario = pd.PrecioUnitario,
               Rentabilidad = pd.Rentabilidad
           }).ToList()
       })
       .ToListAsync();

            return Ok(pedidos);
        }
        [HttpPost]
        public async Task<ActionResult> PostPedido([FromBody] PedidoCreateDto dto)
        {
            var pedido = new Pedido
            {
                ClienteId = dto.ClienteId,
                FechaPedido = dto.FechaPedido,
                Total = dto.Total,
                PedidoDetalles = dto.Detalles.Select(d => new PedidoDetalle
                {
                    ProductoId = d.ProductoId,
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario,
                    Rentabilidad = d.Rentabilidad
                }).ToList()
            };

            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();

            return Ok(new { PedidoId = pedido.PedidoId });
        }
        [HttpPut("{id}")]
        public async Task<ActionResult> PutPedido(int id, [FromBody] PedidoCreateDto dto)
        {
            var pedido = await _context.Pedidos
                .Include(p => p.PedidoDetalles)
                .FirstOrDefaultAsync(p => p.PedidoId == id);

            if (pedido == null) return NotFound();

            pedido.ClienteId = dto.ClienteId;
            pedido.FechaPedido = dto.FechaPedido;
            pedido.Total = dto.Total;

            _context.PedidoDetalles.RemoveRange(pedido.PedidoDetalles);
            pedido.PedidoDetalles = dto.Detalles.Select(d => new PedidoDetalle
            {
                ProductoId = d.ProductoId,
                Cantidad = d.Cantidad,
                PrecioUnitario = d.PrecioUnitario,
                Rentabilidad = d.Rentabilidad
            }).ToList();

            await _context.SaveChangesAsync();
            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePedido(int id)
        {
            var pedido = await _context.Pedidos
                .Include(p => p.PedidoDetalles)
                .FirstOrDefaultAsync(p => p.PedidoId == id);

            if (pedido == null) return NotFound();

            // Primero eliminamos los detalles
            _context.PedidoDetalles.RemoveRange(pedido.PedidoDetalles);

            // Luego eliminamos el pedido
            _context.Pedidos.Remove(pedido);

            await _context.SaveChangesAsync();
            return NoContent();
        }

    }
}

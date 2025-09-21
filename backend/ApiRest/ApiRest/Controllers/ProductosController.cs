using ApiRest.DTOs;
using ApiRest.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiRest.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductosController : ControllerBase
    {
        private readonly AfecordbContext _context;
        public ProductosController(AfecordbContext context)
        {
            _context = context;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductoDto>>> GetProductos()
        {
            var productos = await _context.Productos.Select(c=> new ProductoDto
            {
                ProductoId = c.ProductoId,
                Nombre = c.Nombre,
                Costo = c.Costo,
                PrecioVenta= c.PrecioVenta,
            }).ToListAsync();
            return Ok(productos);
        }
    }
}
